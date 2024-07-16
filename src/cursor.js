/// 二进制解析器和生成器实现

class Parser {
    constructor(buf) {
        this.buf = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.i = 0;
        this.decoder = new TextDecoder();
    }
    u8() {
        this.i += 1;
        return this.view.getUint8(this.i - 1);
    }
    i8() {
        this.i += 1;
        return this.view.getInt8(this.i - 1);
    }
    u16(le) {
        this.i += 2;
        return this.view.getUint16(this.i - 2, le);
    }
    i16(le) {
        this.i += 2;
        return this.view.getInt16(this.i - 2, le);
    }
    u32(le) {
        this.i += 4;
        return this.view.getUint32(this.i - 4, le);
    }
    i32(le) {
        this.i += 4;
        return this.view.getInt32(this.i - 4, le);
    }
    f32(le) {
        this.i += 4;
        return this.view.getFloat32(this.i - 4, le);
    }
    f64(le) {
        this.i += 8;
        return this.view.getFloat64(this.i - 8, le);
    }
    skip(n) {
        this.i += n;
    }
    skipTo(n) {
        this.i = n;
    }
    isEnded() {
        return this.i >= this.buf.byteLength;
    }
    read(n) {
        this.i += n;
        return this.buf.slice(this.i - n, this.i);
    }
    str(n) {
        return this.decoder.decode(this.read(n));
    }
    unicode() {
        // 读取字节长度并调换字节顺序
        let buf = this.read(this.u32() * 2);
        for (let i = 0; i < buf.byteLength; i += 2) 
            [ buf[i], buf[i + 1] ] = [buf[i + 1], buf[i]];
        return String.fromCodePoint.apply(null, 
            new Uint16Array(buf.buffer)).replace(/\u0000/g, "");
    }
}

class Gener {
    constructor(capacity = 1) {
        this.buf = new Uint8Array(capacity);
        this.view = new DataView(this.buf.buffer);
        this.i = 0;
        this.encoder = new TextEncoder();
    }
    go(n) {
        this.i += n;
        while (this.i >= this.buf.byteLength) {
            let old = this.buf;
            this.buf = new Uint8Array(old.byteLength * 2);
            this.view = new DataView(this.buf.buffer);
            this.buf.set(old, 0);
        }
    }
    u8(n) {
        this.go(1);
        this.view.setUint8(this.i - 1, n);
    }
    i8(n) {
        this.go(1);
        this.view.setInt8(this.i - 1, n);
    }
    u16(n) {
        this.go(2);
        this.view.setUint16(this.i - 2, n);
    }
    i16(n) {
        this.go(2);
        this.view.setInt16(this.i - 2, n);
    }
    u32(n) {
        this.go(4);
        this.view.setUint32(this.i - 4, n);
    }
    i32(n) {
        this.go(4);
        this.view.setInt32(this.i - 4, n);
    }
    write(write) {
        this.go(write.byteLength);
        this.buf.set(write, this.i - write.byteLength);
        return write.byteLength;
    }
    str(str) {
        return this.write(this.encoder.encode(str));
    }
    unicode(str) {
        this.u32(str.length);
        let arr = new DataView(new ArrayBuffer(str.length * 2));
        for (let i = 0; i < str.length; ++i) arr.setUint16(i * 2, str.charCodeAt(i));
        this.write(new Uint8Array(arr.buffer));
    }
    markSize() {
        let that = this;
        that.go(4);
        let i = that.i;
        return { i, end() {
            let len = that.i - i;
            that.view.setUint32(i - 4, len);
            return len;
        } }
    }
    export() {
        return this.buf.subarray(0, this.i);
    }
}

module.exports = {
    Parser, Gener
};