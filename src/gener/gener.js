const { Gener } = require("../cursor");
const genLayer = require("./layer");

function gener(psd) {
    let gener = new Gener(4095);
    gener.psd = psd;

    // header
    let { width, height } = psd;
    if (!width || !height)
        throw new TypeError("keypsd.gener需要你的传入的对象有正整数width和height");
    gener.str("8BPS");
    gener.u16(1);
    gener.go(6);
    gener.u16(3);
    gener.u32(height);
    gener.u32(width);
    gener.u16(8);
    gener.u16(3);

    // color mode data 和 image resource
    gener.u32(0);
    gener.u32(0);

    genLayer(gener);

    // 用空白图像填充Image Data Section
    genImageData(gener);
    
    return gener.export();
};

function genImageData(gener) {
    let { width, height } = gener.psd;
    gener.u16(0);
    gener.go(width * height * 4);
    // TODO: PSD无法读取以下RLE ImageData数据
    // let scanLine = encode0s(width);
    // for (let i = 0; i < height * 3; ++i) gener.u16(scanLine.byteLength);
    // for (let i = 0; i < height * 3; ++i) gener.write(scanLine);
    // gener.i8(-128);
}

module.exports = gener;