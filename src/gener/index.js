/// PSD生成 主模块

const { Gener } = require("../cursor");
const genLayer = require("./layer");
// const { encode0s } = require("../rle");
const generFrom = require("./from");
const gener = require("./gener");

module.exports = { gener, generFrom };
