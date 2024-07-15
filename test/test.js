let psd = require("../src/index");
let fs = require("fs");
// 读取psd文件并解析
// let file = fs.readFileSync("./test/temp.psd").buffer;
// let file = require("fs").readFileSync("D:/code/js/keypsd/test/test-text.psd").buffer;
// let result = psd.parse(file);
let gened = psd.gener({ width: 20, height: 20 });
// console.log(psd.parse(gened.buffer));
fs.writeFileSync("./test/write.psd", gened);
// console.dir(result, {depth: null});