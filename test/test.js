let psd = require("../src/index");
let fs = require("fs");

// 初始化wasm
let wasmSrc = fs.readFileSync(
    "./wasm/target/wasm32-unknown-unknown/debug/psd_wasm.wasm").buffer;
psd.wasm.init(wasmSrc).then(()=> {
    // 读取psd文件并解析
    // let file = require("fs").readFileSync("./test/test.psd").buffer;
    let file = require("fs").readFileSync("C:/Users/28224/Desktop/cv.psd").buffer;
    console.log(psd.parse(file));
});