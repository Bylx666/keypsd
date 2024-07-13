class Parser {
    constructor(buffer) {
        this.buf = new Uint8Array(buffer);
        this.view = new DataView(buffer);
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
    skip(n) {
        this.i += n;
    }
    skipTo(n) {
        this.i = n;
    }
    read(n) {
        this.i += n;
        return this.buf.slice(this.i - n, this.i);
    }
    str(n) {
        return this.decoder.decode(this.read(n));
    }
    utf16be(n) {
        // 调换字节顺序
        let buf = this.read(n * 2);
        for (let i = 0; i < buf.byteLength; i += 2) 
            [ buf[i], buf[i + 1] ] = [buf[i + 1], buf[i]];
        return String.fromCodePoint.apply(null, 
            new Uint16Array(buf.buffer)).replace(/\u0000/g, "");
    }
}

class Gener {
    constructor(capacity = 1, targetLE = true) {
        this.buf = new Uint8Array(capacity);
        this.view = new DataView(this.buf.buffer);
        this.i = 0;
        this.encoder = new TextEncoder();
        this.le = targetLE;
    }
    go(n) {
        this.i += n;
        if (this.i >= this.buf.byteLength) {
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
        this.view.setUint16(this.i - 2, n, this.le);
    }
    i16(n) {
        this.go(2);
        this.view.setInt16(this.i - 2, n, this.le);
    }
    u32(n) {
        this.go(4);
        this.view.setUint32(this.i - 4, n, this.le);
    }
    i32(n) {
        this.go(4);
        this.view.setInt32(this.i - 4, n, this.le);
    }
    write(write) {
        this.go(write.byteLength);
        this.buf.set(write, this.i - write.byteLength);
        return write.byteLength;
    }
    str(str) {
        return this.write(this.encoder.encode(str));
    }
    export() {
        return this.buf.subarray(0, this.i);
    }
}

module.exports = {
    Parser, Gener
};