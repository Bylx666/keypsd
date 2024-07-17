/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/cursor.js":
/*!***********************!*\
  !*** ./src/cursor.js ***!
  \***********************/
/***/ ((module) => {

eval("/// 二进制解析器和生成器实现\n\nclass Parser {\n    constructor(buf) {\n        this.buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);\n        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);\n        this.i = 0;\n        this.decoder = new TextDecoder();\n    }\n    u8() {\n        this.i += 1;\n        return this.view.getUint8(this.i - 1);\n    }\n    i8() {\n        this.i += 1;\n        return this.view.getInt8(this.i - 1);\n    }\n    u16(le) {\n        this.i += 2;\n        return this.view.getUint16(this.i - 2, le);\n    }\n    i16(le) {\n        this.i += 2;\n        return this.view.getInt16(this.i - 2, le);\n    }\n    u32(le) {\n        this.i += 4;\n        return this.view.getUint32(this.i - 4, le);\n    }\n    i32(le) {\n        this.i += 4;\n        return this.view.getInt32(this.i - 4, le);\n    }\n    f32(le) {\n        this.i += 4;\n        return this.view.getFloat32(this.i - 4, le);\n    }\n    f64(le) {\n        this.i += 8;\n        return this.view.getFloat64(this.i - 8, le);\n    }\n    skip(n) {\n        this.i += n;\n    }\n    skipTo(n) {\n        this.i = n;\n    }\n    isEnded() {\n        return this.i >= this.buf.byteLength;\n    }\n    read(n) {\n        this.i += n;\n        return this.buf.slice(this.i - n, this.i);\n    }\n    str(n) {\n        return this.decoder.decode(this.read(n));\n    }\n    unicode() {\n        // 读取字节长度并调换字节顺序\n        let buf = this.read(this.u32() * 2);\n        for (let i = 0; i < buf.byteLength; i += 2) \n            [ buf[i], buf[i + 1] ] = [buf[i + 1], buf[i]];\n        return String.fromCodePoint.apply(null, \n            new Uint16Array(buf.buffer)).replace(/\\u0000/g, \"\");\n    }\n}\n\nclass Gener {\n    constructor(capacity = 1) {\n        this.buf = new Uint8Array(capacity);\n        this.view = new DataView(this.buf.buffer);\n        this.i = 0;\n        this.encoder = new TextEncoder();\n    }\n    go(n) {\n        this.i += n;\n        while (this.i >= this.buf.byteLength) {\n            let old = this.buf;\n            this.buf = new Uint8Array(old.byteLength * 2);\n            this.view = new DataView(this.buf.buffer);\n            this.buf.set(old, 0);\n        }\n    }\n    u8(n) {\n        this.go(1);\n        this.view.setUint8(this.i - 1, n);\n    }\n    i8(n) {\n        this.go(1);\n        this.view.setInt8(this.i - 1, n);\n    }\n    u16(n) {\n        this.go(2);\n        this.view.setUint16(this.i - 2, n);\n    }\n    i16(n) {\n        this.go(2);\n        this.view.setInt16(this.i - 2, n);\n    }\n    u32(n) {\n        this.go(4);\n        this.view.setUint32(this.i - 4, n);\n    }\n    i32(n) {\n        this.go(4);\n        this.view.setInt32(this.i - 4, n);\n    }\n    write(write) {\n        this.go(write.byteLength);\n        this.buf.set(write, this.i - write.byteLength);\n        return write.byteLength;\n    }\n    str(str) {\n        return this.write(this.encoder.encode(str));\n    }\n    unicode(str) {\n        this.u32(str.length);\n        let arr = new DataView(new ArrayBuffer(str.length * 2));\n        for (let i = 0; i < str.length; ++i) arr.setUint16(i * 2, str.charCodeAt(i));\n        this.write(new Uint8Array(arr.buffer));\n    }\n    markSize() {\n        let that = this;\n        that.go(4);\n        let i = that.i;\n        return { i, end() {\n            let len = that.i - i;\n            that.view.setUint32(i - 4, len);\n            return len;\n        } }\n    }\n    export() {\n        return this.buf.subarray(0, this.i);\n    }\n}\n\nmodule.exports = {\n    Parser, Gener\n};\n\n//# sourceURL=webpack://keypsd/./src/cursor.js?");

/***/ }),

/***/ "./src/gener/from.js":
/*!***************************!*\
  !*** ./src/gener/from.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const gener = __webpack_require__(/*! ./gener */ \"./src/gener/gener.js\");\n\nasync function str(src) {\n    return await buf(await fetch(src).then(r=> r.blob()));\n}\n\nasync function buf(src) {\n    let i = new Image();\n    i.src = URL.createObjectURL(new Blob([src]));\n    return img(i);\n}\n\nasync function img(src) {\n    await new Promise((resolve, reject)=> {\n        if (src.complete) return resolve();\n        src.onload = ()=> resolve();\n        src.onerror = ()=> reject(new Error(\"错误图片资源\"));\n    });\n    let cv = document.createElement(\"canvas\");\n    cv.width = src.naturalWidth;\n    cv.height = src.naturalHeight;\n    cv.getContext(\"2d\").drawImage(src, 0, 0);\n    return canvas(cv);\n}\n\nfunction canvas(src) {\n    let { width, height } = src;\n    let dat = src.getContext(\"2d\").getImageData(0, 0, width, height);\n    let psd = {\n        width: dat.width, height: dat.height, \n        layers: [{ image: dat.data }]\n    };\n    return gener(psd);\n}\n\nasync function generFrom(src) {\n    if (typeof src === \"string\") return str(src);\n    else if (src instanceof ArrayBuffer || src instanceof Uint8Array || src instanceof Blob) \n        return buf(src);\n    else if (src instanceof HTMLImageElement) return img(src);\n    else if (src instanceof HTMLCanvasElement) return canvas(src);\n    throw new TypeError(\"generFrom不支持该类型. 详见'https://github.com/Bylx666/keypsd/blob/master/readme.md#generFrom'\");\n}\n\nmodule.exports = generFrom;\n\n\n//# sourceURL=webpack://keypsd/./src/gener/from.js?");

/***/ }),

/***/ "./src/gener/gener.js":
/*!****************************!*\
  !*** ./src/gener/gener.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const { Gener } = __webpack_require__(/*! ../cursor */ \"./src/cursor.js\");\nconst genLayer = __webpack_require__(/*! ./layer */ \"./src/gener/layer.js\");\n\nfunction gener(psd) {\n    let gener = new Gener(4095);\n    gener.psd = psd;\n\n    // header\n    let { width, height } = psd;\n    if (!width || !height)\n        throw new TypeError(\"keypsd.gener需要你的传入的对象有正整数width和height\");\n    gener.str(\"8BPS\");\n    gener.u16(1);\n    gener.go(6);\n    gener.u16(3);\n    gener.u32(height);\n    gener.u32(width);\n    gener.u16(8);\n    gener.u16(3);\n\n    // color mode data 和 image resource\n    gener.u32(0);\n    gener.u32(0);\n\n    genLayer(gener);\n\n    // 用空白图像填充Image Data Section\n    genImageData(gener);\n    \n    return gener.export();\n};\n\nfunction genImageData(gener) {\n    let { width, height } = gener.psd;\n    gener.u16(0);\n    gener.go(width * height * 4);\n    // TODO: PSD无法读取以下RLE ImageData数据\n    // let scanLine = encode0s(width);\n    // for (let i = 0; i < height * 3; ++i) gener.u16(scanLine.byteLength);\n    // for (let i = 0; i < height * 3; ++i) gener.write(scanLine);\n    // gener.i8(-128);\n}\n\nmodule.exports = gener;\n\n//# sourceURL=webpack://keypsd/./src/gener/gener.js?");

/***/ }),

/***/ "./src/gener/index.js":
/*!****************************!*\
  !*** ./src/gener/index.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/// PSD生成 主模块\n\nconst { Gener } = __webpack_require__(/*! ../cursor */ \"./src/cursor.js\");\nconst genLayer = __webpack_require__(/*! ./layer */ \"./src/gener/layer.js\");\n// const { encode0s } = require(\"../rle\");\nconst generFrom = __webpack_require__(/*! ./from */ \"./src/gener/from.js\");\nconst gener = __webpack_require__(/*! ./gener */ \"./src/gener/gener.js\");\n\nmodule.exports = { gener, generFrom };\n\n\n//# sourceURL=webpack://keypsd/./src/gener/index.js?");

/***/ }),

/***/ "./src/gener/layer.js":
/*!****************************!*\
  !*** ./src/gener/layer.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/// PSD图层数据生成实现\n\nconst { encode } = __webpack_require__(/*! ../rle */ \"./src/rle.js\");\n\nconst BLEND_MODES_TO_PSD = {\n    \"normal\": \"norm\",\n    \"darken\": \"dark\", \n    \"multiply\": \"mul \", \n    \"color-burn\": \"idiv\", \n    \"lighten\": \"lite\", \n    \"screen\": \"scrn\", \n    \"color-dodge\": \"div \", \n    \"overlay\": \"over\", \n    \"soft-light\": \"sLit\", \n    \"hard-light\": \"hLit\", \n    \"difference\": \"diff\", \n    \"exclusion\": \"smud\", \n    \"hue\": \"hue \", \n    \"saturation\": \"sat \", \n    \"color\": \"colr\", \n    \"luminosity\": \"lum \"\n};\n\nfunction genExtra(gener, { name, folder }) {\n    let sizeExtra = gener.markSize();\n    gener.u32(0);\n\n    let sizeBlendingRanges = gener.markSize();\n    for (let i = 0; i < 10; ++i) gener.u32(65535);\n    sizeBlendingRanges.end();\n\n    gener.u8(3);\n    gener.str(\"art\");\n    \n    // 写入additional info\n    if (name) writeAddition(gener, \"luni\", ()=> gener.unicode(name));\n    if (folder) writeAddition(gener, \"lsct\", ()=> gener.u32(folder === \"close\"? 3: 1));\n\n    sizeExtra.end();\n}\n\nfunction writeAddition(gener, key, writeFunc) {\n    gener.str(\"8BIM\");\n    gener.str(key);\n    let size = gener.markSize();\n    writeFunc();\n    size.end();\n}\n\nfunction genRecord(gener, layer) {\n    // coords\n    let { image, blendMode, opacity, visible, name } = layer;\n    layer.width = layer.width || gener.psd.width;\n    layer.height = layer.height || gener.psd.height;\n    [ layer.left, layer.top ] = [layer.left || 0, layer.top || 0];\n    gener.u32(layer.top);\n    gener.u32(layer.left);\n    gener.u32(layer.top + layer.height);\n    gener.u32(layer.left + layer.width);\n\n    // channels\n    if (image && image.byteLength) {\n        if (image.byteLength !== layer.width * layer.height * 4) \n            throw new Error(`'${name}'图层图像大小错误`);\n        gener.u16(4);\n        // 空出位置, 等channel data写入后从此处写入实际channel数据大小\n        layer.channelMetaIndex = gener.i;\n        gener.go(24);\n    }else gener.u16(0);\n\n    // blend mode\n    gener.str(\"8BIM\");\n    gener.str(BLEND_MODES_TO_PSD[blendMode] || \"norm\");\n    gener.u8(typeof opacity === \"number\"? opacity: 255);\n    gener.u8(0);\n    gener.u8(visible === false? 10: 8);\n    gener.u8(0);\n\n    genExtra(gener, layer);\n}\n\nfunction genGlobalMask(gener) {\n    let sizeGlobalMask = gener.markSize();\n    gener.u16(0);\n    gener.go(8);\n    gener.u16(100);\n    gener.u8(128);\n    gener.go(3);\n    sizeGlobalMask.end();\n}\n\nfunction genChannel(gener, { image, channelMetaIndex, height, width }) {\n    if (!image || !image.byteLength) return;\n\n    let len = image.byteLength / 4;\n    for (let i = 0; i < 4; ++i) {\n        let channelData = new Uint8Array(len);\n        let offset = (i + 3) % 4;\n        for (let j = 0; j < len; ++j) \n            channelData[j] = image[j * 4 + offset];\n        // 进行rle压缩\n        gener.u16(1);\n        // PSD要求每行数据单独压缩并将单行长度写在开头\n        let scanLineIndex = gener.i;\n        gener.go(height * 2);\n        // 表示rle压缩的2字节数字1也属于数据长度一部分\n        let dataLen = height * 2 + 2;\n        for (let i = 0; i < height; ++i) {\n            let rle = encode(channelData.subarray(i * width, (i + 1) * width));\n            gener.view.setUint16(scanLineIndex + i * 2, rle.byteLength);\n            dataLen += rle.byteLength;\n            gener.write(rle);\n        }\n        // 在record部分记录的channel data处写入实际channel大小\n        gener.view.setInt16(channelMetaIndex + i * 6, i - 1);\n        gener.view.setUint32(channelMetaIndex + i * 6 + 2, dataLen);\n    }\n}\n\nmodule.exports = (gener)=> {\n    let sizeLayerMaskSection = gener.markSize();\n    let sizeLayerInfo = gener.markSize();\n\n    let layers = gener.psd.layers;\n    gener.i16(-layers.length);\n    for (let layer of layers) \n        genRecord(gener, layer);\n\n    // channel image\n    for (let layer of layers) \n        genChannel(gener, layer);\n    sizeLayerInfo.end();\n\n    // global mask\n    genGlobalMask(gener);\n    sizeLayerMaskSection.end();\n};\n\n//# sourceURL=webpack://keypsd/./src/gener/layer.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("// https://www.adobe.com/devnet-apps/photoshop/fileformatashtml\n\nconst { gener, generFrom } = __webpack_require__(/*! ./gener */ \"./src/gener/index.js\");\nconst { parse, parseFrom } = __webpack_require__(/*! ./parse */ \"./src/parse/index.js\");\n\nmodule.exports = {\n    parse, parseFrom, gener, generFrom\n};\n\n\n//# sourceURL=webpack://keypsd/./src/index.js?");

/***/ }),

/***/ "./src/parse/descriptor.js":
/*!*********************************!*\
  !*** ./src/parse/descriptor.js ***!
  \*********************************/
/***/ ((module) => {

eval("/// PSD文档单元Descriptor解析\n\nconst DESCRIPTOR_MAP = {\n    TEXT: (parser)=> parser.unicode(), \n    enum(parser) {\n        let name = readId(parser);\n        let value = readId(parser);\n        return { name, value };\n    }, \n    Objc: parseDescriptor, GlbO: parseDescriptor, \n    UntF(parser) {\n        parser.skip(4);\n        return parser.f64();\n    }, \n    doub: (parser)=> parser.f64(), \n    long: (parser)=> parser.i32(), \n    tdta: (parser)=> parser.read(parser.u32()), \n};\n\nlet readId = (parser)=> parser.str(parser.u32() || 4);\n\nfunction parseDescriptor(parser) {\n    let name = parser.unicode();\n    let cls = parser.str(parser.u32() || 4);\n    let itemLen = parser.u32();\n    let descriptor = { name, cls };\n    for (let i = 0; i < itemLen; ++i) {\n        let key = parser.str(parser.u32() || 4).trim();\n        let typ = parser.str(4);\n        descriptor[key] = DESCRIPTOR_MAP[typ](parser);\n    }\n    return descriptor;\n}\n\nmodule.exports = parseDescriptor;\n\n//# sourceURL=webpack://keypsd/./src/parse/descriptor.js?");

/***/ }),

/***/ "./src/parse/from.js":
/*!***************************!*\
  !*** ./src/parse/from.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const parse = __webpack_require__(/*! ./parse */ \"./src/parse/parse.js\");\n\nmodule.exports = async (src)=> {\n    if (typeof src === \"string\") return parse(await (await fetch(src)).arrayBuffer());\n    else if (src instanceof ArrayBuffer || src instanceof Uint8Array) return parse(src);\n    else if (src instanceof Blob) return parse(await src.arrayBuffer());\n    throw new TypeError(\"parseFrom不支持该类型. 详见'https://github.com/Bylx666/keypsd/blob/master/readme.md#parseFrom'\");\n};\n\n//# sourceURL=webpack://keypsd/./src/parse/from.js?");

/***/ }),

/***/ "./src/parse/header.js":
/*!*****************************!*\
  !*** ./src/parse/header.js ***!
  \*****************************/
/***/ ((module) => {

eval("/// PSD文件头解析\n\nconst COLOR_MODE = {\n    3: \"RGB\"\n};\n\nlet assert = (expr, message)=> {\n    if (!expr) throw new Error(message)\n};\nmodule.exports = (parser)=> {\n    assert(parser.str(4) === \"8BPS\", \"无效PSD文件\");\n    parser.skip(8);\n    let channels = parser.u16();\n    let height = parser.u32();\n    let width = parser.u32();\n    let depth = parser.u16();\n    assert(depth === 8, \"暂时只支持8位深度图像\");\n    let mode = COLOR_MODE[parser.u16()];\n    assert(mode, \"暂时只支持RGB色彩模式\");\n\n    return {\n        channels, height, width, depth, mode\n    }\n}\n\n//# sourceURL=webpack://keypsd/./src/parse/header.js?");

/***/ }),

/***/ "./src/parse/index.js":
/*!****************************!*\
  !*** ./src/parse/index.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst parse = __webpack_require__(/*! ./parse */ \"./src/parse/parse.js\");\nconst parseFrom = __webpack_require__(/*! ./from */ \"./src/parse/from.js\");\n\nmodule.exports = {\n    parse, parseFrom\n};\n\n//# sourceURL=webpack://keypsd/./src/parse/index.js?");

/***/ }),

/***/ "./src/parse/layer.js":
/*!****************************!*\
  !*** ./src/parse/layer.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/// PSD图层解析实现\n\nconst parseChannels = __webpack_require__(/*! ./layer_channel */ \"./src/parse/layer_channel.js\");\nconst parseDescriptor = __webpack_require__(/*! ./descriptor */ \"./src/parse/descriptor.js\");\nconst { parseEngineData } = __webpack_require__(/*! ./text */ \"./src/parse/text.js\");\n\nconst BLEND_MODES_TO_CSS = {\n    \"norm\": \"normal\",\n    \"dark\": \"darken\", \n    \"mul\": \"multiply\", \n    \"idiv\": \"color-burn\", \n    \"lite\": \"lighten\", \n    \"scrn\": \"screen\", \n    \"div\": \"color-dodge\", \n    \"over\": \"overlay\", \n    \"sLit\": \"soft-light\", \n    \"hLit\": \"hard-light\", \n    \"diff\": \"difference\", \n    \"smud\": \"exclusion\", \n    \"hue\": \"hue\", \n    \"sat\": \"saturation\", \n    \"colr\": \"color\", \n    \"lum\": \"luminosity\"\n};\n\n\nlet pad4 = (n)=> (n + 3) & ~3;\n\nfunction parseExtra(parser) {\n    const fns = {\n        // name\n        luni() { return { name: parser.unicode() }; },\n        // id, psd好像各图层id一样, 误导性好强\n        lyid() {\n            parser.skip(4);\n            return { id: parser.u32() };\n        },\n        // 组\n        lsct() { return { folder: parser.u32() === 3? \"close\": \"open\" }; }, \n        // 文本图层\n        TySh() {\n            parser.skip(2);\n\n            let transform = new Float64Array(6);\n            for (let i = 0; i < 6; ++i) transform[i] = parser.f64();\n\n            parser.skip(6);\n            let raw = parseDescriptor(parser);\n            let chars = parseEngineData(raw.EngineData);\n\n            // 跳过wrap段\n            parser.skip(6);\n            parseDescriptor(parser);\n\n            return { text: {\n                transform, raw, chars, text: chars.text\n                // 文本信息的坐标文档中未明确数据类型, 不采用\n            } };\n        }\n    };\n\n    parser.skip(4);\n    let key = parser.str(4);\n    let len = parser.u32();\n    let end = parser.i + len;\n    let result = fns[key]? fns[key](): null;\n    parser.skipTo(end);\n    return result;\n}\n\nfunction parseRecord(parser) {\n    let top = parser.i32(), left = parser.i32(), \n        bottom = parser.i32(), right = parser.i32(), \n        height = bottom - top, width = right - left;\n    let channelCount = parser.u16();\n    let channels = new Array(channelCount);\n    for (let i = 0; i < channelCount; ++i) \n        channels[i] = {\n            id: parser.i16(), \n            // channel图像数据的大小不应包含这个压缩码还是扫描行长度, 无从考证\n            dataLen: parser.u32() - 2\n        };\n    parser.skip(4);\n    let blendMode = BLEND_MODES_TO_CSS[parser.str(4).trim()];\n    if (!blendMode) blendMode = \"normal\";\n    let opacity = parser.u8();\n    parser.skip(1);\n    let visible = !(parser.u8() & 2);\n    parser.skip(1);\n\n    let extraSize = parser.u32();\n    let extraEnd = parser.i + extraSize;\n    // 跳过Layer mask和Layer blending ranges\n    parser.skip(parser.u32());\n    parser.skip(parser.u32());\n\n    let name = parser.str(pad4(parser.u8() + 1) - 1);\n\n    // 解析Additional info\n    let layer = {\n        top, left, width, height, name, visible, blendMode, opacity, channels\n    };\n    while (parser.i < extraEnd) \n        Object.assign(layer, parseExtra(parser));\n    parser.skipTo(extraEnd);\n    \n    return layer;\n}\n\nmodule.exports = (parser)=> {\n    let size = parser.u32();\n    let end = parser.i + size;\n\n    // info start\n    parser.u32();\n    let count = Math.abs(parser.i16());\n    let layers = new Array(count);\n    for (let i = 0; i < count; ++i) \n        layers[i] = parseRecord(parser);\n    \n    // 解析图层图像\n    parseChannels(parser, layers);\n\n    parser.skipTo(end);\n    return layers;\n};\n\n//# sourceURL=webpack://keypsd/./src/parse/layer.js?");

/***/ }),

/***/ "./src/parse/layer_channel.js":
/*!************************************!*\
  !*** ./src/parse/layer_channel.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/// PSD 图层图像数据转RGBA图像数据实现\n\nconst { decode } = __webpack_require__(/*! ../rle */ \"./src/rle.js\");\n\nfunction getLayerRgba(parser, layer) {\n    let { width, height, channels } = layer;\n    let size = width * height;\n    let rgba = new Uint8Array(size * 4);\n\n    for (let channel of channels) {\n        // 不处理无图像的图层, 蒙版和Zip图像数据\n        let compression = parser.u16();\n        if (!channel.dataLen || channel.id < -1 || compression > 1) continue;\n\n        // 读取data\n        let data = parser.read(channel.dataLen);\n        // RLE解压要跳过channel image data前面标识扫描行大小的数据\n        if (compression === 1) data = decode(data.subarray(height * 2), size);\n        if (data.byteLength !== size) \n            console.warn(`'${ layer.name }'图层的'${ channel.id }'通道数据损坏`);\n        \n        // 获取rgba对应的偏移\n        switch (channel.id) {\n            case -1: \n                var offset = 3; break;\n            case 0: case 1: case 2: \n                var offset = channel.id; break;\n            default: continue;\n        }\n\n        // 写入rgba\n        for (let i = 0; i < size; ++i) \n            rgba[i * 4 + offset] = data[i];\n    }\n\n    return rgba;\n}\n\nmodule.exports = (parser, layers)=> {\n    for (let layer of layers) \n        layer.image = getLayerRgba(parser, layer);\n};\n\n\n//# sourceURL=webpack://keypsd/./src/parse/layer_channel.js?");

/***/ }),

/***/ "./src/parse/parse.js":
/*!****************************!*\
  !*** ./src/parse/parse.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/// PSD解析 主模块\nconst { Parser } = __webpack_require__(/*! ../cursor */ \"./src/cursor.js\");\nconst parseHeader = __webpack_require__(/*! ./header */ \"./src/parse/header.js\");\nconst parseLayers = __webpack_require__(/*! ./layer */ \"./src/parse/layer.js\");\n\nmodule.exports = (buf)=> {\n    if (buf instanceof ArrayBuffer) buf = new Uint8Array(buf);\n    if (!buf instanceof Uint8Array)\n        throw new TypeError(\"keypsd.parse只允许`Uint8Array`和`ArrayBuffer`\");\n    let file = new Parser(buf);\n    let psd = parseHeader(file);\n\n    // 跳过Color Mode Data\n    file.skip(file.u32());\n    // 跳过Image Resources\n    file.skip(file.u32());\n\n    // 解析图层\n    psd.layers = parseLayers(file);\n    return psd;\n};\n\n//# sourceURL=webpack://keypsd/./src/parse/parse.js?");

/***/ }),

/***/ "./src/parse/text.js":
/*!***************************!*\
  !*** ./src/parse/text.js ***!
  \***************************/
/***/ ((module) => {

eval("/// PSD图层文本数据解析实现\n\n// 该函数实现在: \n// https://github.com/Agamnentzar/ag-psd/blob/master/src/engineData.ts\nfunction decodeEngineData(data) {\n    function isWhitespace(char) {\n        // ' ', '\\n', '\\r', '\\t'\n        return char === 32 || char === 10 || char === 13 || char === 9;\n    }\n    function isNumber(char) {\n        // 0123456789.-\n        return (char >= 48 && char <= 57) || char === 46 || char === 45;\n    }\n    \n    var index = 0;\n    function skipWhitespace() {\n        while (index < data.length && isWhitespace(data[index])) {\n            index++;\n        }\n    }\n    function getTextByte() {\n        var byte = data[index];\n        index++;\n        if (byte === 92) { // \\\n            byte = data[index];\n            index++;\n        }\n        return byte;\n    }\n    function getText() {\n        var result = '';\n        if (data[index] === 41) { // )\n            index++;\n            return result;\n        }\n        // Strings start with utf-16 BOM\n        if (data[index] !== 0xFE || data[index + 1] !== 0xFF) {\n            throw new Error('Invalid utf-16 BOM');\n        }\n        index += 2;\n        // ), ( and \\ characters are escaped in ascii manner, remove the escapes before interpreting\n        // the bytes as utf-16\n        while (index < data.length && data[index] !== 41) { // )\n            var high = getTextByte();\n            var low = getTextByte();\n            var char = (high << 8) | low;\n            result += String.fromCharCode(char);\n        }\n        index++;\n        return result;\n    }\n    var root = null;\n    var stack = [];\n    function pushContainer(value) {\n        if (!stack.length) {\n            stack.push(value);\n            root = value;\n        }\n        else {\n            pushValue(value);\n            stack.push(value);\n        }\n    }\n    function pushValue(value) {\n        if (!stack.length)\n            throw new Error('Invalid data');\n        var top = stack[stack.length - 1];\n        if (typeof top === 'string') {\n            stack[stack.length - 2][top] = value;\n            pop();\n        }\n        else if (Array.isArray(top)) {\n            top.push(value);\n        }\n        else {\n            throw new Error('Invalid data');\n        }\n    }\n    function pushProperty(name) {\n        if (!stack.length)\n            pushContainer({});\n        var top = stack[stack.length - 1];\n        if (top && typeof top === 'string') {\n            if (name === 'nil') {\n                pushValue(null);\n            }\n            else {\n                pushValue(\"/\".concat(name));\n            }\n        }\n        else if (top && typeof top === 'object') {\n            stack.push(name);\n        }\n        else {\n            throw new Error('Invalid data');\n        }\n    }\n    function pop() {\n        if (!stack.length)\n            throw new Error('Invalid data');\n        stack.pop();\n    }\n    skipWhitespace();\n    while (index < data.length) {\n        var i = index;\n        var char = data[i];\n        if (char === 60 && data[i + 1] === 60) { // <<\n            index += 2;\n            pushContainer({});\n        }\n        else if (char === 62 && data[i + 1] === 62) { // >>\n            index += 2;\n            pop();\n        }\n        else if (char === 47) { // /\n            index += 1;\n            var start = index;\n            while (index < data.length && !isWhitespace(data[index])) {\n                index++;\n            }\n            var name_1 = '';\n            for (var i_1 = start; i_1 < index; i_1++) {\n                name_1 += String.fromCharCode(data[i_1]);\n            }\n            pushProperty(name_1);\n        }\n        else if (char === 40) { // (\n            index += 1;\n            pushValue(getText());\n        }\n        else if (char === 91) { // [\n            index += 1;\n            pushContainer([]);\n        }\n        else if (char === 93) { // ]\n            index += 1;\n            pop();\n        }\n        else if (char === 110 && data[i + 1] === 117 && data[i + 2] === 108 && data[i + 3] === 108) { // null\n            index += 4;\n            pushValue(null);\n        }\n        else if (char === 116 && data[i + 1] === 114 && data[i + 2] === 117 && data[i + 3] === 101) { // true\n            index += 4;\n            pushValue(true);\n        }\n        else if (char === 102 && data[i + 1] === 97 && data[i + 2] === 108 && data[i + 3] === 115 && data[i + 4] === 101) { // false\n            index += 5;\n            pushValue(false);\n        }\n        else if (isNumber(char)) {\n            var value = '';\n            while (index < data.length && isNumber(data[index])) {\n                value += String.fromCharCode(data[index]);\n                index++;\n            }\n            pushValue(parseFloat(value));\n        }\n        else {\n            index += 1;\n            console.log(\"Invalid token \".concat(String.fromCharCode(char), \" at \").concat(index));\n            // ` near ${String.fromCharCode.apply(null, data.slice(index - 10, index + 20) as any)}` +\n            // `data [${Array.from(data.slice(index - 10, index + 20)).join(', ')}]`\n        }\n        skipWhitespace();\n    }\n    return root;\n}\n\nfunction parseEngineData(data) {\n    data = decodeEngineData(data);\n\n    let {\n        Editor: { Text: text }, \n        StyleRun: { RunArray: styles, RunLengthArray: stylesMap } \n    } = data.EngineDict;\n    text = text.replace(/\\r/g, \"\\n\");\n\n    // PSD储存的字体名为Postscript Name, 而不是family name.\n    // 因此即使获取到了也无法直接用于前端\n    // 你或许需要使用 queryLocalFonts 函数来手动查询(兼容性十分差)\n    // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/queryLocalFonts\n    let fonts = data.ResourceDict.FontSet.map(o=> o.Name);\n\n    let arr = Array.from(text).map((char, i)=> {\n        // 获取style\n        for (var styleI = 0; styleI < styles.length; ) {\n            i -= stylesMap[styleI];\n            if (i < 0) break;\n            styleI += 1;\n        }\n        let style = styles[styleI].StyleSheet.StyleSheetData;\n        let color = style.FillColor.Values.map(n=> 0 | (n * 255));\n        // 将alpha放在最后\n        color.push(color.shift());\n\n        return {\n            char, \n            color: new Uint8Array(color), \n            font: fonts[style.Font], \n            size: style.FontSize, \n            underline: !!style.Underline, \n            bold: !!style.FauxBold, \n            italic: !!style.FauxItalic\n        };\n    });\n    arr.text = text;\n    return arr;\n}\n\nmodule.exports = {\n    parseEngineData\n};\n\n\n//# sourceURL=webpack://keypsd/./src/parse/text.js?");

/***/ }),

/***/ "./src/rle.js":
/*!********************!*\
  !*** ./src/rle.js ***!
  \********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/// RLE基础压缩解压算法实现\n\nconst { Gener, Parser } = __webpack_require__(/*! ./cursor */ \"./src/cursor.js\");\n\nfunction decode(data, size) {\n    let parser = new Parser(data);\n    let gener = new Gener(size);\n\n    while (!parser.isEnded()) {\n        let len = parser.i8();\n        if (len >= 0) \n            gener.write(parser.read(1 + len));\n        else if (len !== -128) {\n            let byte = parser.u8();\n            gener.write(new Uint8Array(1 - len).fill(byte));\n        }\n    }\n    return gener.export();\n}\n\nfunction _encode(parser, gener) {\n    while (!parser.isEnded()) {\n        let start = parser.u8();\n        let count = -1;\n        let char;\n\n        // 先假设是重复的, 并读取重复数量\n        while (!parser.isEnded() && (char = parser.u8()) === start && count > -127) \n            --count;\n\n        // 确实是重复的话写入重复信息\n        if (count !== -1) {\n            gener.i8(count - 2);\n            gener.u8(start);\n            parser.i -= 1;\n        }\n        // 否则寻找不重复数量\n        else {\n            // 保留一位到最后写入重复次数\n            let startIndex = gener.i;\n            gener.go(1);\n            gener.u8(start);\n\n            while (count < 126 && !parser.isEnded()) {\n                let peek = parser.u8();\n                if (peek === char) {\n                    parser.i -= 1;\n                    break;\n                };\n                gener.u8(char);\n                char = peek;\n                ++count;\n            }\n            gener.view.setInt8(startIndex, count + 1);\n        }\n    }\n    return gener.export();\n}\n\nfunction _encode(parser, gener) {\n    while (!parser.isEnded()) {\n        let a = parser.u8();\n        // 最后一个字节\n        if (parser.isEnded()) {\n            gener.u8(0);\n            gener.u8(a);\n            break;\n        }\n\n        let b = parser.u8();\n        let count = -1;\n        // 编码循环部分\n        if (a === b) {\n            while (!parser.isEnded() && (b = parser.u8()) === a && count > -127)\n                count --;\n            gener.i8(count);\n            gener.u8(a);\n            if (parser.isEnded() && b === a) break;\n        }\n        // 编码不循环部分\n        else {\n            let lenIndex = gener.i;\n            gener.go(1);\n            gener.u8(a);\n\n            while (!parser.isEnded() && a !== b && count < 127) {\n                count ++;\n                gener.u8(b);\n                [ a, b ] = [b, parser.u8()];\n            }\n            \n            if (parser.isEnded() && b !== a) {\n                gener.u8(b);\n                gener.view.setInt8(lenIndex, count + 2);\n                break;\n            }\n\n            gener.i --;\n            parser.i --;\n            gener.view.setInt8(lenIndex, count);\n        }\n        parser.i --;\n    }\n    return gener.export();\n}\n\nconst encode = (data)=> _encode(new Parser(data), new Gener(data.byteLength));\n\n/**\n * 为n个0字节生成RLE数据\n * \n * 减少一次内存分配开销\n * \n * @param {number} n 正整数\n */\nfunction encode0s(n) {\n    let gener = new Gener(0 | (n / 64) + 4);\n    let group128 = 0 | (n / 128);\n    let left = n % 128;\n    while (group128--) {\n        gener.i8(-127);\n        gener.u8(0);\n    };\n    if (left) {\n        gener.i8(left - 1);\n        gener.go(left);\n    }\n    return gener.export();\n}\n\nmodule.exports = { decode, encode, encode0s };\n\n//# sourceURL=webpack://keypsd/./src/rle.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	keypsd = __webpack_exports__;
/******/ 	
/******/ })()
;