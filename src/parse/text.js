/// PSD图层文本数据解析实现

// 该函数实现在: 
// https://github.com/Agamnentzar/ag-psd/blob/master/src/engineData.ts
function decodeEngineData(data) {
    function isWhitespace(char) {
        // ' ', '\n', '\r', '\t'
        return char === 32 || char === 10 || char === 13 || char === 9;
    }
    function isNumber(char) {
        // 0123456789.-
        return (char >= 48 && char <= 57) || char === 46 || char === 45;
    }
    
    var index = 0;
    function skipWhitespace() {
        while (index < data.length && isWhitespace(data[index])) {
            index++;
        }
    }
    function getTextByte() {
        var byte = data[index];
        index++;
        if (byte === 92) { // \
            byte = data[index];
            index++;
        }
        return byte;
    }
    function getText() {
        var result = '';
        if (data[index] === 41) { // )
            index++;
            return result;
        }
        // Strings start with utf-16 BOM
        if (data[index] !== 0xFE || data[index + 1] !== 0xFF) {
            throw new Error('Invalid utf-16 BOM');
        }
        index += 2;
        // ), ( and \ characters are escaped in ascii manner, remove the escapes before interpreting
        // the bytes as utf-16
        while (index < data.length && data[index] !== 41) { // )
            var high = getTextByte();
            var low = getTextByte();
            var char = (high << 8) | low;
            result += String.fromCharCode(char);
        }
        index++;
        return result;
    }
    var root = null;
    var stack = [];
    function pushContainer(value) {
        if (!stack.length) {
            stack.push(value);
            root = value;
        }
        else {
            pushValue(value);
            stack.push(value);
        }
    }
    function pushValue(value) {
        if (!stack.length)
            throw new Error('Invalid data');
        var top = stack[stack.length - 1];
        if (typeof top === 'string') {
            stack[stack.length - 2][top] = value;
            pop();
        }
        else if (Array.isArray(top)) {
            top.push(value);
        }
        else {
            throw new Error('Invalid data');
        }
    }
    function pushProperty(name) {
        if (!stack.length)
            pushContainer({});
        var top = stack[stack.length - 1];
        if (top && typeof top === 'string') {
            if (name === 'nil') {
                pushValue(null);
            }
            else {
                pushValue("/".concat(name));
            }
        }
        else if (top && typeof top === 'object') {
            stack.push(name);
        }
        else {
            throw new Error('Invalid data');
        }
    }
    function pop() {
        if (!stack.length)
            throw new Error('Invalid data');
        stack.pop();
    }
    skipWhitespace();
    while (index < data.length) {
        var i = index;
        var char = data[i];
        if (char === 60 && data[i + 1] === 60) { // <<
            index += 2;
            pushContainer({});
        }
        else if (char === 62 && data[i + 1] === 62) { // >>
            index += 2;
            pop();
        }
        else if (char === 47) { // /
            index += 1;
            var start = index;
            while (index < data.length && !isWhitespace(data[index])) {
                index++;
            }
            var name_1 = '';
            for (var i_1 = start; i_1 < index; i_1++) {
                name_1 += String.fromCharCode(data[i_1]);
            }
            pushProperty(name_1);
        }
        else if (char === 40) { // (
            index += 1;
            pushValue(getText());
        }
        else if (char === 91) { // [
            index += 1;
            pushContainer([]);
        }
        else if (char === 93) { // ]
            index += 1;
            pop();
        }
        else if (char === 110 && data[i + 1] === 117 && data[i + 2] === 108 && data[i + 3] === 108) { // null
            index += 4;
            pushValue(null);
        }
        else if (char === 116 && data[i + 1] === 114 && data[i + 2] === 117 && data[i + 3] === 101) { // true
            index += 4;
            pushValue(true);
        }
        else if (char === 102 && data[i + 1] === 97 && data[i + 2] === 108 && data[i + 3] === 115 && data[i + 4] === 101) { // false
            index += 5;
            pushValue(false);
        }
        else if (isNumber(char)) {
            var value = '';
            while (index < data.length && isNumber(data[index])) {
                value += String.fromCharCode(data[index]);
                index++;
            }
            pushValue(parseFloat(value));
        }
        else {
            index += 1;
            console.log("Invalid token ".concat(String.fromCharCode(char), " at ").concat(index));
            // ` near ${String.fromCharCode.apply(null, data.slice(index - 10, index + 20) as any)}` +
            // `data [${Array.from(data.slice(index - 10, index + 20)).join(', ')}]`
        }
        skipWhitespace();
    }
    return root;
}

module.exports = (data)=> {
    data = decodeEngineData(data);
    // console.dir(data, {depth:null});

    let {
        Editor: { Text: text }, 
        StyleRun: { RunArray: styles, RunLengthArray: stylesMap } 
    } = data.EngineDict;
    text = text.replace(/\r/g, "\n");

    // PSD储存的字体名为Postscript Name, 而不是family name.
    // 因此即使获取到了也无法直接用于前端
    // 你或许需要使用 queryLocalFonts 函数来手动查询(兼容性十分差)
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/queryLocalFonts
    let fonts = data.ResourceDict.FontSet.map(o=> o.Name);

    let arr = Array.from(text).map((char, i)=> {
        // 获取style
        for (var styleI = 0; styleI < styles.length; ) {
            i -= stylesMap[styleI];
            if (i < 0) break;
            styleI += 1;
        }
        let style = styles[styleI].StyleSheet.StyleSheetData;
        let color = style.FillColor.Values.map(n=> 0 | (n * 255));
        // 将alpha放在最后
        color.push(color.shift());

        return {
            char, 
            color: new Uint8Array(color), 
            font: fonts[style.Font], 
            size: style.FontSize, 
            underline: !!style.Underline, 
            bold: !!style.FauxBold, 
            italic: !!style.FauxItalic
        };
    });
    arr.text = text;
    return arr;
}

