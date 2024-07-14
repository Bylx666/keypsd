const { Gener, Parser } = require("../cursor");
const { log } = console;

function getLayerRgba(parser, layer) {
    let { width, height, channels } = layer;
    let size = width * height;
    let rgba = new Uint8Array(size * 4);

    for (let channel of channels) {
        // 不处理无图像的图层, 蒙版和Zip图像数据
        let compression = parser.u16();
        if (!channel.dataLen || channel.id < -1 || compression > 1) continue;

        // 读取data
        let data = parser.read(channel.dataLen);
        if (compression === 1) data = decodeRLE(data, width, height);
        if (data.byteLength !== size) 
            console.warn(`'${ layer.name }'图层的'${ channel.id }'通道数据损坏`);
        
        // 获取rgba对应的偏移
        switch (channel.id) {
            case -1: 
                var offset = 3; break;
            case 0: case 1: case 2: 
                var offset = channel.id; break;
            default: continue;
        }

        // 写入rgba
        for (let i = 0; i < size; ++i) 
            rgba[i * 4 + offset] = data[i];
    }

    return rgba;
}

function decodeRLE(data, width, height) {
    let dataLen = data.byteLength;
    let parser = new Parser(data.buffer);
    let gener = new Gener(width * height);

    // 跳过channel image data前面标识扫描行大小的数据
    parser.skip(height * 2);
    while (parser.i < dataLen) {
        let len = parser.i8();
        if (len >= 0) 
            gener.write(parser.read(1 + len));
        else if (len !== -128) {
            let byte = parser.u8();
            gener.write(new Uint8Array(1 - len).fill(byte));
        }
    }
    return gener.export();
}

module.exports = (parser, layers)=> {
    for (let layer of layers) 
        layer.image = getLayerRgba(parser, layer);
};
