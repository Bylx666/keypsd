let psd = require("../src/index");
let fs = require("fs");
// 读取psd文件并解析
let file = require("fs").readFileSync("./test/test.psd").buffer;
console.log(psd.parse(file));