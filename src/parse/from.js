const parse = require("./parse");

module.exports = async (src)=> {
    if (typeof src === "string") return parse(await (await fetch(src)).arrayBuffer());
    else if (src instanceof ArrayBuffer || src instanceof Uint8Array) return parse(src);
    else if (src instanceof Blob) return parse(await src.arrayBuffer());
    throw new TypeError("parseFrom不支持该类型. 详见'https://github.com/Bylx666/keypsd/blob/master/readme.md#parseFrom'");
};