/// PSD生成 主模块

const { Gener } = require("../cursor");
const genLayer = require("./layer");
const { encode0s } = require("../rle");

function gener(psd) {
    let gener = new Gener(4095);
    gener.psd = psd;

    // header
    gener.str("8BPS");
    gener.u16(1);
    gener.go(6);
    gener.u16(3);
    gener.u32(psd.width);
    gener.u32(psd.height);
    gener.u16(8);
    gener.u16(3);

    // color mode data 和 image resource
    gener.u32(0);

    gener.u32(0);

    genLayer(gener);

    gener.u16(0);
    gener.write(new Uint8Array(psd.width * psd.height * 4));
    
    return gener.export();
};

function generFrom() {}

module.exports = { gener, generFrom };
