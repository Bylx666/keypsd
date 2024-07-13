use std::cell::Cell;

mod cursor;
mod layer;

#[export_name = "alloc"]
extern fn alloc(len: usize)-> usize {
    Vec::<u8>::with_capacity(len).leak().as_mut_ptr() as usize
}

const GLOBAL_STR_MAX: usize = 256;
struct GlobalStr (Cell<[u8; GLOBAL_STR_MAX]>);
static GLOBAL_STR: GlobalStr = GlobalStr(Cell::new([0; GLOBAL_STR_MAX]));

// wasm不考虑多线程
unsafe impl Sync for GlobalStr {}

/// 由js主动设置报错时自动log
/// 
/// 返回值则是初始化log函数返回的字符串的固定指针
#[export_name = "setPanicHook"]
extern fn set_panic_hook()-> usize {
    std::panic::set_hook(Box::new(|inf| log(&inf.to_string())));
    &GLOBAL_STR as *const GlobalStr as usize
}

/// 向console.log打印字符串
fn log(s: &str) {
    #[link(wasm_import_module = "console")]
    extern "C" {
        fn log(len: usize);
    }

    // 检查边界后将该字符串写入`GLOBAL_STR`
    let mut bytes = s.as_bytes();
    if bytes.len() >= GLOBAL_STR_MAX { bytes = &bytes[0..GLOBAL_STR_MAX] }
    let mut res = [0u8; GLOBAL_STR_MAX];
    unsafe {
        std::ptr::copy_nonoverlapping(bytes.as_ptr(), &mut res as _, bytes.len());
        GLOBAL_STR.0.set(res);
        log(bytes.len());
    }
}

