/// PSD图层数据生成实现

const { encode } = require("../rle");

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

function genExtra(gener, { name, folder }) {
    let sizeExtra = gener.markSize();
    gener.u32(0);

    let sizeBlendingRanges = gener.markSize();
    for (let i = 0; i < 10; ++i) gener.u32(65535);
    sizeBlendingRanges.end();

    gener.u8(3);
    gener.str("art");
    
    // 写入additional info
    if (name) writeAddition(gener, "luni", ()=> gener.unicode(name));
    if (folder) writeAddition(gener, "lsct", ()=> gener.u32(folder === "close"? 3: 1));

    sizeExtra.end();
}

function writeAddition(gener, key, writeFunc) {
    gener.str("8BIM");
    gener.str(key);
    let size = gener.markSize();
    writeFunc();
    size.end();
}

function genRecord(gener, layer) {
    // coords
    let { image, blendMode, opacity, visible, name } = layer;
    layer.width = layer.width || gener.psd.width;
    layer.height = layer.height || gener.psd.height;
    [ layer.left, layer.top ] = [layer.left || 0, layer.top || 0];
    gener.u32(layer.top);
    gener.u32(layer.left);
    gener.u32(layer.top + layer.height);
    gener.u32(layer.left + layer.width);

    // channels
    if (image && image.byteLength) {
        if (image.byteLength !== layer.width * layer.height * 4) 
            throw new Error(`'${name}'图层图像大小错误`);
        gener.u16(4);
        // 空出位置, 等channel data写入后从此处写入实际channel数据大小
        layer.channelMetaIndex = gener.i;
        gener.go(24);
    }else gener.u16(0);

    // blend mode
    gener.str("8BIM");
    gener.str(BLEND_MODES_TO_PSD[blendMode] || "norm");
    gener.u8(typeof opacity === "number"? opacity: 255);
    gener.u8(0);
    gener.u8(visible === false? 10: 8);
    gener.u8(0);

    genExtra(gener, layer);
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

function genChannel(gener, { image, channelMetaIndex, height, width }) {
    if (!image || !image.byteLength) return;

    let len = image.byteLength / 4;
    for (let i = 0; i < 4; ++i) {
        let channelData = new Uint8Array(len);
        let offset = (i + 3) % 4;
        for (let j = 0; j < len; ++j) 
            channelData[j] = image[j * 4 + offset];
        // 进行rle压缩
        gener.u16(1);
        // PSD要求每行数据单独压缩并将单行长度写在开头
        let scanLineIndex = gener.i;
        gener.go(height * 2);
        // 表示rle压缩的2字节数字1也属于数据长度一部分
        let dataLen = height * 2 + 2;
        for (let i = 0; i < height; ++i) {
            let rle = encode(channelData.subarray(i * width, (i + 1) * width));
            gener.view.setUint16(scanLineIndex + i * 2, rle.byteLength);
            dataLen += rle.byteLength;
            gener.write(rle);
        }
        // 在record部分记录的channel data处写入实际channel大小
        gener.view.setInt16(channelMetaIndex + i * 6, i - 1);
        gener.view.setUint32(channelMetaIndex + i * 6 + 2, dataLen);
    }
}

module.exports = (gener)=> {
    let sizeLayerMaskSection = gener.markSize();
    let sizeLayerInfo = gener.markSize();

    let layers = gener.psd.layers;
    gener.i16(-layers.length);
    for (let layer of layers) 
        genRecord(gener, layer);

    // channel image
    for (let layer of layers) 
        genChannel(gener, layer);
    sizeLayerInfo.end();

    // global mask
    genGlobalMask(gener);
    sizeLayerMaskSection.end();
};