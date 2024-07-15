const { Gener } = require("../cursor");
const genLayer = require("./layer");

module.exports = (psd)=> {
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

    // gener.u32(0);
    let buf = require("fs").readFileSync("./test/image-resource.bin").buffer;
    gener.u32(buf.byteLength);
    gener.write(new Uint8Array(buf));

    genLayer(gener);

    gener.u16(0);
    gener.write(new Uint8Array(psd.width * psd.height * 3));
    
    return gener.export();
};
