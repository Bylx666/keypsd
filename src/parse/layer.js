const parseChannels = require("./layer_channel");

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


let pad2 = (n)=> (n + 1) & ~1;
let pad4 = (n)=> (n + 3) & ~3;
let { log } = console;

function parseExtra(parser) {
    const fns = {
        // name
        luni() {
            let unitLen = parser.u32();
            return { name: parser.utf16be(unitLen) };
        },
        // id, psd好像各图层id一样, 误导性好强
        // lyid() {
        //     parser.skip(4);
        //     return { id: parser.u32() };
        // },
        // 组
        lsct() {
            let t = parser.u32();
            return { folder: t === 3? "close": "open" };
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
    parser.skip(3);

    let extraSize = parser.u32();
    let extraEnd = parser.i + extraSize;
    // 跳过Layer mask和Layer blending ranges
    parser.skip(parser.u32());
    parser.skip(parser.u32());

    let name = parser.str(pad4(parser.u8() + 1) - 1);

    // 解析Additional info
    let layer = {
        top, left, width, height, name, blendMode, opacity, channels
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