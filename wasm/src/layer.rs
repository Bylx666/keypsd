use crate::log;

#[derive(Debug)]
#[allow(unused)]
struct LayerChannel {
    id: i8, 
    data: Vec<u8>
}

#[export_name = "getLayerRgba"]
extern fn get_layer_rgba(ptr: *mut u32) {
    use crate::cursor::Parser;

    let len = unsafe { *ptr } as _;
    let src = unsafe { Vec::from_raw_parts(ptr as *mut u8, len, len) };
    let parser: Parser = Parser::new(&src);
    parser.skip(4);
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
    // let r = channels.iter().find(|chan| chan.id == 0).unwrap();
    // let g = channels.iter().find(|chan| chan.id == 1).unwrap();
    // let b = channels.iter().find(|chan| chan.id == 2).unwrap();
    // let a = channels.iter().find(|chan| chan.id == -1).unwrap();
}

fn parse_rle(data: &[u8], capacity: usize)-> Vec<u8> {
    use crate::cursor::{ Parser, Gener };

    if data.is_empty() { return Vec::new(); }
    
    let parser = Parser::new(data);
    let mut res = Gener::with_capacity(capacity);
    while !parser.is_ended() {
        let len = parser.i8() as i16;
        if len >= 0 {
            let len = (1 + len) as usize;
            let d = parser.read(len);
            res.write(d);
        }
        else if len != -128 {
            let len = (1 - len) as usize;
            let byte = parser.u8();
            res.write(&vec![byte; len]);
        }
    }
    let b = res.resume();
    log!("{b:x?}");
    b
}