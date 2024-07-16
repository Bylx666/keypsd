/// PSD解析 主模块

const { Parser } = require("../cursor");
const parseHeader = require("./header");
const parseLayers = require("./layer");

function parse(buf) {
    if (buf instanceof ArrayBuffer) buf = new Uint8Array(buf);
    let file = new Parser(buf);
    let psd = parseHeader(file);

    // 跳过Color Mode Data
    file.skip(file.u32());
    // 跳过Image Resources
    file.skip(file.u32());

    // 解析图层
    psd.layers = parseLayers(file);
    return psd;
}

async function parseUrl(path) {
    let buf = await (await fetch(path)).arrayBuffer();
    return parse(buf);
}

module.exports = {
    parse, parseUrl
};