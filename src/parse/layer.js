/// PSD图层解析实现

const parseChannels = require("./layer_channel");
const parseDescriptor = require("./descriptor");
const parseEngineData = require("./text");

const BLEND_MODES_TO_CSS = {
    "norm": "normal",
    "dark": "darken", 
    "mul": "multiply", 
    "idiv": "color-burn", 
    "lite": "lighten", 
    "scrn": "screen", 
    "div": "color-dodge", 
    "over": "overlay", 
    "sLit": "soft-light", 
    "hLit": "hard-light", 
    "diff": "difference", 
    "smud": "exclusion", 
    "hue": "hue", 
    "sat": "saturation", 
    "colr": "color", 
    "lum": "luminosity"
};


let pad4 = (n)=> (n + 3) & ~3;

function parseExtra(parser) {
    const fns = {
        // name
        luni() { return { name: parser.unicode() }; },
        // id, psd好像各图层id一样, 误导性好强
        lyid() {
            parser.skip(4);
            return { id: parser.u32() };
        },
        // 组
        lsct() { return { folder: parser.u32() === 3? "close": "open" }; }, 
        // 文本图层
        TySh() {
            parser.skip(2);

            let transform = new Float64Array(6);
            for (let i = 0; i < 6; ++i) transform[i] = parser.f64();

            parser.skip(6);
            let raw = parseDescriptor(parser);
            let chars = parseEngineData(raw.EngineData);

            // 跳过wrap段
            parser.skip(6);
            parseDescriptor(parser);

            return { text: {
                transform, raw, chars, text: chars.text
                // 文本信息的坐标文档中未明确数据类型, 不采用
            } };
        }
    };

    parser.skip(4);
    let key = parser.str(4);
    let len = parser.u32();
    let end = parser.i + len;
    let result = fns[key]? fns[key](): null;
    parser.skipTo(end);
    return result;
}

function parseRecord(parser) {
    let top = parser.i32(), left = parser.i32(), 
        bottom = parser.i32(), right = parser.i32(), 
        height = bottom - top, width = right - left;
    let channelCount = parser.u16();
    let channels = new Array(channelCount);
    for (let i = 0; i < channelCount; ++i) 
        channels[i] = {
            id: parser.i16(), 
            // channel图像数据的大小不应包含这个压缩码还是扫描行长度, 无从考证
            dataLen: parser.u32() - 2
        };
    parser.skip(4);
    let blendMode = BLEND_MODES_TO_CSS[parser.str(4).trim()];
    if (!blendMode) blendMode = "normal";
    let opacity = parser.u8();
    parser.skip(1);
    let visible = !(parser.u8() & 2);
    parser.skip(1);

    let extraSize = parser.u32();
    let extraEnd = parser.i + extraSize;
    // 跳过Layer mask和Layer blending ranges
    parser.skip(parser.u32());
    parser.skip(parser.u32());

    let name = parser.str(pad4(parser.u8() + 1) - 1);

    // 解析Additional info
    let layer = {
        top, left, width, height, name, visible, blendMode, opacity, channels
    };
    while (parser.i < extraEnd) 
        Object.assign(layer, parseExtra(parser));
    parser.skipTo(extraEnd);
    
    return layer;
}

module.exports = (parser)=> {
    let size = parser.u32();
    let end = parser.i + size;

    // info start
    parser.u32();
    let count = Math.abs(parser.i16());
    let layers = new Array(count);
    for (let i = 0; i < count; ++i) 
        layers[i] = parseRecord(parser);
    
    // 解析图层图像
    parseChannels(parser, layers);

    parser.skipTo(end);
    return layers;
};