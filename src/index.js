// https://www.adobe.com/devnet-apps/photoshop/fileformatashtml

const { gener, generFrom } = require("./gener");
const { parse, parseFrom } = require("./parse");
const RLE = require("./rle");

module.exports = {
    parse, parseFrom, gener, generFrom, RLE
};
