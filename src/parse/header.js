/// PSD文件头解析

const COLOR_MODE = {
    3: "RGB"
};

let assert = (expr, message)=> {
    if (!expr) throw new Error(message)
};
module.exports = (parser)=> {
    assert(parser.str(4) === "8BPS", "无效PSD文件");
    parser.skip(8);
    let channels = parser.u16();
    let height = parser.u32();
    let width = parser.u32();
    let depth = parser.u16();
    assert(depth === 8, "暂时只支持8位深度图像");
    let mode = COLOR_MODE[parser.u16()];
    assert(mode, "暂时只支持RGB色彩模式");

    return {
        channels, height, width, depth, mode
    }
}