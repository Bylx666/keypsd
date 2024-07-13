#[derive(Debug)]
#[allow(unused)]
struct LayerChannel {
    id: i8, 
    data: Vec<u8>
}

/// js在rust中分配空间后写入被解析的数据, 由此函数拿回所有权
/// 
/// 此后该函数将返回值的数据生命周期延长出该函数, 并由js执行width*height长度的dealloc
#[export_name = "getLayerRgba"]
extern fn get_layer_rgba(ptr: *mut u32)-> *mut u8 {
    use crate::cursor::{ Parser, Gener };

    fn parse_rle(data: &[u8], size: usize)-> Vec<u8> {
        if data.is_empty() { return Vec::new(); }
        
        let parser = Parser::new(data);
        let mut gener = Gener::with_capacity(size);
        while !parser.is_ended() {
            let len = parser.i8() as i16;
            if len >= 0 {
                let len = (1 + len) as usize;
                if len + parser.i() > parser.len() { break; }
                let d = parser.read(len);
                gener.write(d);
            }
            else if len != -128 {
                let len = (1 - len) as usize;
                if 1 + parser.i() > parser.len() { break; }
                let byte = parser.u8();
                gener.write(&vec![byte; len]);
            }
        }
    
        let data = gener.resume();
        assert_eq!(data.len(), size, "通道数据错误");
        data
    }

    // 合并rgba通道
    fn concat_channels(channels: Vec<LayerChannel>, size: usize)-> Vec<u8> {
        let mut rgba = vec![0; size * 4];
        let mut has_alpha = false;
        
        for channel in channels {
            // 获取rgba对应的0 1 2 3
            let offset = match channel.id {
                n@0 | n@1 | n@2 => n, 
                -1=> { has_alpha = true; 3 }, 
                _=> continue
            } as usize;

            for (i, n) in channel.data.iter().enumerate() {
                rgba[i * 4 + offset] = *n;
            }
        }

        // 如果没有alpha通道就把alpha通道设置为255
        if !has_alpha {
            for (i, _) in (0..size).enumerate() {
                rgba[i * 4 + 3] = 255;
            }
        }

        rgba
    }

    // 读取数据长度和数据
    let len = unsafe { *ptr } as _;
    let src = unsafe { Vec::from_raw_parts(ptr as *mut u8, len, len) };
    let parser: Parser = Parser::new(&src);
    parser.skip(4);

    // 读取图层宽高和实际通道数量
    let width = parser.u32() as usize;
    let height = parser.u32() as usize;
    let channel_len = parser.u16();

    let mut channels = Vec::with_capacity(4);
    for _ in 0..channel_len {
        let id = parser.i8();
        let is_rle = parser.u8() == 1;
        let size = parser.u32();
        let data = parser.read(size as _).to_vec();
        let data = if is_rle {
            // If the compression code is 1, the image data starts with the byte
            // counts for all the scan lines in the channel (LayerBottom-LayerTop) ,
            // with each count stored as a two-byte value.
            // 把扫描行的长度数据跳过
            parse_rle(&data[2 * height..], width * height)
        } else { data };
        let channel = LayerChannel { id, data };
        channels.push(channel);
    }

    // 合并channels
    concat_channels(channels, width * height).leak().as_mut_ptr()
}