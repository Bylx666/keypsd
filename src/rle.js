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

function _encode(parser, gener) {
    while (!parser.isEnded()) {
        let start = parser.u8();
        let count = -1;
        let char;

        // 先假设是重复的, 并读取重复数量
        while (!parser.isEnded() && (char = parser.u8()) === start && count > -127) 
            --count;

        // 确实是重复的话写入重复信息
        if (count !== -1) {
            gener.i8(count - 2);
            gener.u8(start);
            parser.i -= 1;
        }
        // 否则寻找不重复数量
        else {
            // 保留一位到最后写入重复次数
            let startIndex = gener.i;
            gener.go(1);
            gener.u8(start);

            while (count < 126 && !parser.isEnded()) {
                let peek = parser.u8();
                if (peek === char) {
                    parser.i -= 1;
                    break;
                };
                gener.u8(char);
                char = peek;
                ++count;
            }
            gener.view.setInt8(startIndex, count + 1);
        }
    }
    return gener.export();
}

function _encode(parser, gener) {
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
            while (!parser.isEnded() && (b = parser.u8()) === a && count > -127)
                count --;
            gener.i8(count);
            gener.u8(a);
            if (parser.isEnded() && b === a) break;
        }
        // 编码不循环部分
        else {
            let lenIndex = gener.i;
            gener.go(1);
            gener.u8(a);

            while (!parser.isEnded() && a !== b && count < 127) {
                count ++;
                gener.u8(b);
                [ a, b ] = [b, parser.u8()];
            }
            
            if (parser.isEnded() && b !== a) {
                gener.u8(b);
                gener.view.setInt8(lenIndex, count + 2);
                break;
            }

            gener.i --;
            parser.i --;
            gener.view.setInt8(lenIndex, count);
        }
        parser.i --;
    }
    return gener.export();
}

const encode = (data)=> _encode(new Parser(data), new Gener(data.byteLength));

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