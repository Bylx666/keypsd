use std::cell::Cell;

/// 类似`std::io::Cursor`, 但包装了将字节直接读取为u16, u32的能力(小字端)
pub struct Parser<'a> {
    buf: &'a [u8], 
    i: Cell<u32>
}

macro_rules! impl_parser {
    ($($n:ident: $t:ty,)*) => {
        $(
            #[doc = "从当前位置读取"]
            #[doc = stringify!($t)]
            pub fn $n(&self)-> $t {
                self.read_t()
            }
        )*
    };
}

#[allow(unused)]
impl<'a> Parser<'a> {
    pub fn new(buf: &'a [u8])-> Self {
        Parser {
            buf, i: Cell::new(0)
        }
    }
    /// 跳过n个byte
    pub fn skip(&self, n: usize) {
        self.i.set(self.i.get() + n as u32);
    }
    /// 获取当前浮标位置
    pub fn i(&self)-> usize {
        self.i.get() as _
    }
    pub fn len(&self)-> usize {
        self.buf.len()
    }
    fn read_t<T: Copy>(&self)-> T {
        let size = std::mem::size_of::<T>();
        // 边界检查
        if size + self.i() > self.len() {
            panic!("边界溢出: i: {}, len: {}. 无法再读取 {} 字节", self.i(), self.len(), size);
        }

        self.skip(size);
        unsafe {
            let p = self.buf.as_ptr().add(self.i() - size) as *const T;
            std::ptr::read_unaligned(p)
        }
    }
    impl_parser! {
        u8: u8, u16: u16, u32: u32, 
        i8: i8, i16: i16, i32: i32,
    }
    /// 从当前处向后读取n字节
    pub fn read(&self, n: usize)-> &[u8] {
        self.skip(n);
        &self.buf[self.i() - n..self.i()]
    }
    pub fn is_ended(&self)-> bool {
        self.i() >= self.buf.len()
    }
}

macro_rules! impl_gener {
    ($($n:ident: $t:ty,)*) => {
        $(
            #[doc = "从当前位置写入"]
            #[doc = stringify!($t)]
            pub fn $n(&mut self, n: $t) {
                self.write(&n.to_ne_bytes());
            }
        )*
    };
}

/// 与Parser相反, 可以写入u16, u32(小字端)
/// 
/// 其实就是generator
pub struct Gener {
    buf: Vec<u8>
}

#[allow(unused)]
impl Gener {
    pub fn with_capacity(capacity: usize)-> Self {
        Gener {
            buf: Vec::with_capacity(capacity)
        }
    }
    pub fn i(&self)-> usize {
        self.buf.len()
    }
    pub fn skip(&mut self, n: usize) {
        self.write(&vec![0; n])
    }
    pub fn write(&mut self, buf: &[u8]) {
        self.buf.extend_from_slice(buf);
    }
    impl_gener! {
        u8: u8, u16: u16, u32: u32, 
        i8: i8, i16: i16, i32: i32,
    }
    pub fn resume(self)-> Vec<u8> {
        self.buf
    }
}
