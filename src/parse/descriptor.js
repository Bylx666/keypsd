/// PSD文档单元Descriptor解析

const DESCRIPTOR_MAP = {
    TEXT: (parser)=> parser.unicode(), 
    enum(parser) {
        let name = readId(parser);
        let value = readId(parser);
        return { name, value };
    }, 
    Objc: parseDescriptor, GlbO: parseDescriptor, 
    UntF(parser) {
        parser.skip(4);
        return parser.f64();
    }, 
    doub: (parser)=> parser.f64(), 
    long: (parser)=> parser.i32(), 
    tdta: (parser)=> parser.read(parser.u32()), 
};

let readId = (parser)=> parser.str(parser.u32() || 4);

function parseDescriptor(parser) {
    let name = parser.unicode();
    let cls = readId(parser);
    let itemLen = parser.u32();
    let descriptor = { name, cls };
    for (let i = 0; i < itemLen; ++i) {
        let key = readId(parser).trim();
        let typ = parser.str(4);
        descriptor[key] = DESCRIPTOR_MAP[typ](parser);
    }
    return descriptor;
}

module.exports = parseDescriptor;