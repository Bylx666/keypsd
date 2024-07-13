const wasm = require("../wasm");
const { Gener } = require("../cursor");
const { log } = require("console");

/*
    `channel.js`向`toRgbaRaw`传参内存布局: 

    file: 
    bytes | is unsigned | name | description
    ----|---|--------------|--
    4   | u | `totalSize`  | 总数据大小
    4   | u | `width`      | 图层宽度
    4   | u | `height`     | 图层高度
    2   | u | `channelCnt` | 通道数量
    var |   | for `channel` in `channelCnt` | channelCnt个channel

    channel: 
    bytes | is unsigned | name | description
    --------|---|---------------|--
    1       |   | `id`          | 一个数字: rgb-> 123, a-> -1
    1       | u | `compression` | 压缩方式: 0-> 未压缩, 1-> RLE压缩
    32      | u | `dataLen`     | 数据大小
    dataLen |   | `data`        | 该channel的数据
*/

module.exports = async (parser, layers)=> {
    // 获取wasm
    let { memory, alloc, dealloc, getLayerRgba } = await wasm.get();

    for (let layer of layers) {
        let { width, height, channels } = layer;

        // 准备给rust传参
        let raw = new Gener(128, true);
        // 留4格存总数居大小
        raw.go(4);
        // 写入宽高
        raw.u32(width);
        raw.u32(height);

        // 保留2位写入实际通道数量
        let channelCount = 0;
        let channelCountIndex = raw.i;
        raw.u16(0);

        for (let channel of channels) {
            // 不处理无图像的图层, 蒙版和Zip图像数据
            let compression = parser.u16();
            if (!channel.dataLen || channel.id < -1 || compression > 1) continue;

            channelCount += 1;
            let data = parser.read(channel.dataLen);
            raw.i8(channel.id);
            raw.u8(compression);
            raw.u32(data.byteLength);
            raw.write(data);
        }
        // 在开头写入总数居大小
        raw.view.setUint32(0, raw.i, true);
        // 写入通道数量
        raw.view.setUint16(channelCountIndex, channelCount, true);

        // 分配空间并传入rust
        let arg = raw.export();
        let ptr = alloc(arg.byteLength);
        new Uint8Array(memory.buffer, ptr).set(arg);
        let rgbaPtr = getLayerRgba(ptr);

        // 把结果数据复制出来并清理这片内存
        layer.image = new Uint8Array(memory.buffer, rgbaPtr, width * height).slice();
        dealloc(rgbaPtr, width * height);
    }
};
