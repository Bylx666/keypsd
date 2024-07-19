/// PSD文档单元Descriptor生成

const BOUNDS_MEMBER_DICTIONARY = {
    Left: ["UntF", 0],
    Top: ["UntF", 0],
    Rght: ["UntF", 0],
    Btom: ["UntF", 0]
};
let TEXT_DICTIONARY = {
    name: "", 
    cls: "TxLr", 
    ls: {
        Txt: ["TEXT", ""], 
        textGriddin: ["enum", ["textGridding", "None"]], 
        Ornt: ["enum", ["Ornt", "Hrzn"]], 
        AntA: ["enum", ["Annt", "antiAliasSharp"]], 
        bounds: ["Objc", {
            name: "", 
            cls: "bounds",
            ls: BOUNDS_MEMBER_DICTIONARY
        }], 
        boundingBox: ["Objc", {
            name: "",
            cls: "boundingBox",
            ls: BOUNDS_MEMBER_DICTIONARY
        }], 
        TextIndex: ["long", 0], 
        EngineData: ["tdta", new Uint8Array(0)]
    }
};

const DESCRIPTOR_MAP = {
    TEXT: (gener, str)=> gener.unicode(str), 
    enum(gener, [name, value]) {
        writeId(gener, name);
        writeId(gener, value);
    }, 
    Objc: generDescriptor, GlbO: generDescriptor, 
    UntF(gener, n) {
        gener.str("#Pnt");
        return gener.f64(n);
    }, 
    doub: (gener, n)=> gener.f64(n), 
    long: (gener, n)=> gener.i32(n), 
    tdta: (gener, data)=> gener.u32(data.byteLength) | gener.write(data), 
};

let writeId = (gener, str)=> gener.u32(str.length) | gener.str(str);

function generDescriptor(gener, { name, cls, ls }) {
    gener.unicode(name);
    writeId(gener, cls);
    let keys = Object.keys(ls);
    gener.u32(keys.length);
    for (const key of keys) {
        let [ typ, val ] = ls[key];
        writeId(gener, key);
        gener.str(typ);
        DESCRIPTOR_MAP[typ](gener, val);
    }
}

// 套用text框架生成descriptor
generDescriptor.text = (gener, text, engineData)=> {
    TEXT_DICTIONARY.ls.Txt[1] = text;
    TEXT_DICTIONARY.ls.EngineData[1] = engineData;
    generDescriptor(gener, TEXT_DICTIONARY);
};
// 生成text wrap
generDescriptor.textWrap = (gener)=> generDescriptor(gener, {
    name: "", 
    cls: "wrap", 
    ls: {}
});

module.exports = generDescriptor;