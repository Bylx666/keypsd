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
            length: parser.u32()
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
    let extra = {};
    while (parser.i < extraEnd) 
        Object.assign(extra, parseExtra(parser));
    parser.skipTo(extraEnd);
    if (extra.name) name = extra.name;
    return {
        top, left, width, height, name, blendMode, opacity, channels, extra
    };
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
    parser.skipTo(end);
    return layers;
};