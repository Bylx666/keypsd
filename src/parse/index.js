const { Parser } = require("../cursor");
const parseHeader = require("./header");
const parseLayers = require("./layer");

function parse(buf) {
    let file = new Parser(buf, true);
    let psd = parseHeader(file);

    // 跳过Color Mode Data
    file.skip(file.u32());
    // 跳过Image Resources
    file.skip(file.u32());

    // 解析图层
    psd.layers = parseLayers(file);
    return psd;
}

async function parse_url(path) {
    let buf = await (await fetch(path)).arrayBuffer();
    return parse(buf);
}

module.exports = {
    parse, parse_url
};