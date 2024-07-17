const { parse, gener } = require("../index");
const { readFileSync, writeFileSync } = require("fs");

// 读取psd文件并解析
let file = readFileSync("./src/test/temp.psd");
let result = parse(file);
console.dir(result, {depth: null});

let gened = gener(result);
// console.log(parse(gened));
writeFileSync("./src/test/write.psd", gened);