const CHANNEL_LENGTH: usize = 4;

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
    let is_rle = parser.u8() == 1;
    let width = parser.u32();
    let height = parser.u32();

    let mut channels = Vec::with_capacity(4);
    for _ in 0..CHANNEL_LENGTH {
        let channel = LayerChannel {
            id: parser.i8(), 
            data: {
                let d = parser.read(parser.u32() as _).to_vec();
                if is_rle { parse_rle(d, width * height) } else { d }
            }
        };
        channels.push(channel);
    }

    // 合并channels
    // let r = channels.iter().find(|chan| chan.id == 0).unwrap();
    // let g = channels.iter().find(|chan| chan.id == 1).unwrap();
    // let b = channels.iter().find(|chan| chan.id == 2).unwrap();
    // let a = channels.iter().find(|chan| chan.id == -1).unwrap();
}

fn parse_rle(data: Vec<u8>, capacity: u32)-> Vec<u8> {
    use crate::cursor::{ Parser, Gener };
    let parser = Parser::new(&data);
    let mut res = Gener::with_capacity(capacity as usize);
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
    res.resume()
}