
const BLEND_MODES_TO_PSD = {
    "normal": "norm",
    "darken": "dark", 
    "multiply": "mul ", 
    "color-burn": "idiv", 
    "lighten": "lite", 
    "screen": "scrn", 
    "color-dodge": "div ", 
    "overlay": "over", 
    "soft-light": "sLit", 
    "hard-light": "hLit", 
    "difference": "diff", 
    "exclusion": "smud", 
    "hue": "hue ", 
    "saturation": "sat ", 
    "color": "colr", 
    "luminosity": "lum "
};

function genExtra(gener) {
    let sizeExtra = gener.markSize();
    gener.u32(0);

    let sizeBlendingRanges = gener.markSize();
    for (let i = 0; i < 10; ++i) gener.u32(65535);
    sizeBlendingRanges.end();

    gener.u8(2);
    gener.str("art");
    let buf = require("fs").readFileSync("./test/layer-addition.bin");
    gener.write(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
    sizeExtra.end();
}

function genRecord(gener, layer) {
    // coords
    let { left, top, width, height } = layer;
    gener.u32(top);
    gener.u32(left);
    gener.u32(left + width);
    gener.u32(top + height);

    // channels
    gener.u16(4);
    for (let i = -1; i < 3; ++i) {
        gener.i16(i);
        gener.u32(3);
    }

    // blend mode
    gener.str("8BIM");
    gener.str("norm");
    gener.u8(128);
    gener.u8(0);
    gener.u8(3);
    gener.u8(0);

    genExtra(gener);
}

function genGlobalMask(gener) {
    let sizeGlobalMask = gener.markSize();
    gener.u16(0);
    gener.go(8);
    gener.u16(100);
    gener.u8(128);
    gener.go(3);
    sizeGlobalMask.end();
}

module.exports = (gener)=> {
    let sizeLayerMaskSection = gener.markSize();
    // TODO: pad2
    let sizeLayerInfo = gener.markSize();
    gener.i16(1);
    genRecord(gener, { width: 1, height: 1, left: 0, top: 0 });

    // channel image
    new Uint8Array([255, 255, 0, 0]).forEach(n=> {
        gener.u16(0);
        gener.u8(n);
    });
    sizeLayerInfo.end();

    // global mask
    genGlobalMask(gener);
    sizeLayerMaskSection.end();
};