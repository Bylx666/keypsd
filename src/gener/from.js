const gener = require("./gener");

async function str(src) {
    return await buf(await fetch(src).then(r=> r.blob()));
}

async function buf(src) {
    let i = new Image();
    i.src = URL.createObjectURL(new Blob([src]));
    return img(i);
}

async function img(src) {
    await new Promise((resolve, reject)=> {
        if (src.complete) return resolve();
        src.onload = ()=> resolve();
        src.onerror = ()=> reject(new Error("错误图片资源"));
    });
    let cv = document.createElement("canvas");
    cv.width = src.naturalWidth;
    cv.height = src.naturalHeight;
    cv.getContext("2d").drawImage(src, 0, 0);
    return canvas(cv);
}

function canvas(src) {
    let { width, height } = src;
    let dat = src.getContext("2d").getImageData(0, 0, width, height);
    let psd = {
        width: dat.width, height: dat.height, 
        layers: [{ image: dat.data }]
    };
    return gener(psd);
}

async function generFrom(src) {
    if (typeof src === "string") return str(src);
    else if (src instanceof ArrayBuffer || src instanceof Uint8Array || src instanceof Blob) 
        return buf(src);
    else if (src instanceof HTMLImageElement) return img(src);
    else if (src instanceof HTMLCanvasElement) return canvas(src);
    throw new TypeError("generFrom不支持该类型. 详见'https://github.com/Bylx666/keypsd/blob/master/readme.md#generFrom'");
}

module.exports = generFrom;
