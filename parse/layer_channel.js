const wasm = require("../wasm");
const { Gener } = require("../cursor");
const { log } = require("console");

/*
    `channel.js`向`toRgbaRaw`传参内存布局: 

*/

module.exports = async (parser, layers)=> {
    // 获取wasm
    let { memory, alloc, getLayerRgba } = await wasm.get();

    for (let layer of layers) {
        let { width, height, channels } = layer;
        // 只处理拥有RGBA四个通道的数据
        if (channels.length !== 4) continue;

        // 准备给rust传参
        let raw = new Gener(128);
        // 留4格存总数居大小
        raw.go(4);
        // 写入宽高
        raw.u32(width);
        raw.u32(height);
        raw.u16(channels.length);

        for (let channel of channels) {
            // 不处理无图像的图层, 蒙版和Zip图像数据
            let compression = parser.u16();
            if (!channel.dataLen || channel.id < -1 || compression > 1) continue;

            let data = parser.read(channel.dataLen);
            raw.i8(channel.id);
            raw.u8(compression);
            raw.u32(data.byteLength);
            raw.write(data);
        }
        // 在开头写入总数居大小
        raw.view.setUint32(0, raw.i, true);
        let arg = raw.export();
        let ptr = alloc(arg.byteLength);
        new Uint8Array(memory.buffer, ptr).set(arg);
        layer.image = getLayerRgba(ptr);
    }
};