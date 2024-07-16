/// PSD 图层图像数据转RGBA图像数据实现

const { decode } = require("../rle");

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
        // RLE解压要跳过channel image data前面标识扫描行大小的数据
        if (compression === 1) data = decode(data.subarray(height * 2), size);
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

module.exports = (parser, layers)=> {
    for (let layer of layers) 
        layer.image = getLayerRgba(parser, layer);
};
