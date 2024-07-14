let psd = require("../src/index");
let fs = require("fs");
// 读取psd文件并解析
// let file = require("fs").readFileSync("./test/test.psd").buffer;
let file = require("fs").readFileSync("D:/code/js/keypsd/test/test-text.psd").buffer;
let result = psd.parse(file);
// console.log(result);