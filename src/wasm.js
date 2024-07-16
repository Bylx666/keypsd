/// WASM模块接口, 已废弃

const initObj = {
    console: {
        log(len) {
            let src = new Uint8Array(wasm.memory.buffer, globalStrPtr, len);
            console.log(decoder.decode(src));
        }
    }
};

let wasm;
let decoder = new TextDecoder();
let globalStrPtr;

// 支持加载Uint8Array, ArrayBuffer和fetch格式
async function init(src) {
    if (src instanceof Promise) src = await src;
    if (src instanceof Response) src = await src.arrayBuffer();
    if (src instanceof Uint8Array) src = src.buffer;
    if (!src instanceof ArrayBuffer) 
        throw new TypeError("只允许fetch或ArrayBuffer作为wasm源");
    wasm = (await WebAssembly.instantiate(src, initObj)).instance.exports;
    globalStrPtr = wasm.setPanicHook();
}

module.exports = {
    init, get() { return wasm }
};