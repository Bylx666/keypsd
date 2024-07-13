const WASM_SOURCE = ".\\wasm\\target\\wasm32-unknown-unknown\\debug\\psd_wasm.wasm";

let wasm;
let decoder = new TextDecoder();
let globalStrPtr;

let process = WebAssembly.instantiate(require("fs").readFileSync(WASM_SOURCE), {
    console: {
        log(len) {
            let src = new Uint8Array(wasm.memory.buffer, globalStrPtr, len);
            console.log(decoder.decode(src));
        }
    }
});

process.then(w=> {
    wasm = w.instance.exports;
    globalStrPtr = wasm.setPanicHook();
});

module.exports = {
    async get() {
        return (await process).instance.exports;
    }
};