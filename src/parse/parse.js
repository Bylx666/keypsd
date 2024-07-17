/// PSD解析 主模块
const { Parser } = require("../cursor");
const parseHeader = require("./header");
const parseLayers = require("./layer");

module.exports = (buf)=> {
    if (buf instanceof ArrayBuffer) buf = new Uint8Array(buf);
    if (!buf instanceof Uint8Array)
        throw new TypeError("keypsd.parse只允许`Uint8Array`和`ArrayBuffer`");
    let file = new Parser(buf);
    let psd = parseHeader(file);

    // 跳过Color Mode Data
    file.skip(file.u32());
    // 跳过Image Resources
    file.skip(file.u32());

    // 解析图层
    psd.layers = parseLayers(file);
    return psd;
};