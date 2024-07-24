/// RLE基础压缩解压算法实现

const { Gener, Parser } = require("./cursor");

function decode(data, size) {
    let parser = new Parser(data);
    let gener = new Gener(size);

    while (!parser.isEnded()) {
        let len = parser.i8();
        if (len >= 0) 
            gener.write(parser.read(1 + len));
        else if (len !== -128) {
            let byte = parser.u8();
            gener.write(new Uint8Array(1 - len).fill(byte));
        }
    }
    return gener.export();
}

function encode(data) {
    let parser = new Parser(data), gener = new Gener(data.byteLength);
    while (!parser.isEnded()) {
        let a = parser.u8();
        // 最后一个字节
        if (parser.isEnded()) {
            gener.u8(0);
            gener.u8(a);
            break;
        }

        let b = parser.u8();
        let count = -1;
        // 编码循环部分
        if (a === b) {
            while (count > -128 && !parser.isEnded() && (b = parser.u8()) === a)
                count --;
            if (count === -128) gener.i8(-127);
            else gener.i8(count);
            gener.u8(a);
            if (parser.isEnded() && b === a && count !== -128) break;
        }
        // 编码不循环部分
        else {
            let lenIndex = gener.i;
            count = 1;
            gener.go(1);
            gener.u8(a);

            while (count < 128 && !parser.isEnded() && a !== b) {
                count ++;
                gener.u8(b);
                [ a, b ] = [b, parser.u8()];
            }
            
            if (parser.isEnded() && b !== a && count !== 128) {
                gener.u8(b);
                gener.view.setInt8(lenIndex, count === 128? 127: count);
                break;
            }

            gener.i --;
            parser.i --;
            gener.view.setInt8(lenIndex, count - 2);
        }
        parser.i --;
    }
    return gener.export();
}

/**
 * 为n个0字节生成RLE数据
 * 
 * 减少一次内存分配开销
 * 
 * @param {number} n 正整数
 */
function encode0s(n) {
    let gener = new Gener(0 | (n / 64) + 4);
    let group128 = 0 | (n / 128);
    let left = n % 128;
    while (group128--) {
        gener.i8(-127);
        gener.u8(0);
    };
    if (left) {
        gener.i8(left - 1);
        gener.go(left);
    }
    return gener.export();
}

module.exports = { decode, encode, encode0s };