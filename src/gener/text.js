/// 文本图层数据生成
const { Gener } = require("../cursor");
const { text: generTextDescriptor, textWrap: generWrapDescriptor } = require("./descriptor");

const DEFAULT_FONTSET = [
  {
    Name: 'MicrosoftJhengHeiUIRegular',
    Script: 2,
    FontType: 1,
    Synthetic: 3
  }
];

const DEFAULT_SHEETSET = [
  {
    Name: '正常 RGB',
    DefaultStyleSheet: 0,
    Properties: {}
  }
];

let DICTIONARY = {
    EngineDict: {
        Editor: { Text: '' },
        ParagraphRun: {
            DefaultRunData: {
                ParagraphSheet: { DefaultStyleSheet: 0, Properties: {} },
                Adjustments: { Axis: [ 1, 0, 1 ], XY: [ 0, 0 ] }
            },
            RunArray: [
                {
                    ParagraphSheet: DEFAULT_SHEETSET[0],
                    Adjustments: { Axis: [ 1, 0, 1 ], XY: [ 0, 0 ] }
                }
            ],
            RunLengthArray: [0],
            IsJoinable: 1
        },
        StyleRun: {
            DefaultRunData: { StyleSheet: { StyleSheetData: {} } },
            RunArray: [],
            RunLengthArray: [],
            IsJoinable: 0
        },
        GridInfo: { GridIsOn: false },
        AntiAlias: 4,
        UseFractionalGlyphWidths: true,
        Rendered: {
            Version: 1,
            Shapes: {
                WritingDirection: 0,
                Children: [
                    {
                        ShapeType: 0,
                        Procession: 0,
                        Lines: { WritingDirection: 0, Children: [] },
                        Cookie: {
                            Photoshop: {
                                ShapeType: 0,
                                PointBase: [ 0, 0 ],
                                Base: {
                                    ShapeType: 0,
                                    TransformPoint0: [ 1, 0 ],
                                    TransformPoint1: [ 0, 1 ],
                                    TransformPoint2: [ 0, 0 ]
                                }
                            }
                        }
                    }
                ]
            }
        }
    },
    ResourceDict: {
        ParagraphSheetSet: DEFAULT_SHEETSET,
        StyleSheetSet: DEFAULT_SHEETSET,
        FontSet: DEFAULT_FONTSET
    },
    DocumentResources: {
        ParagraphSheetSet: DEFAULT_SHEETSET,
        StyleSheetSet: DEFAULT_SHEETSET,
        FontSet: DEFAULT_FONTSET
    }
};

const FLOAT_PROPERTY = [
    'Axis', 'XY', 'Zone', 'WordSpacing', 'FirstLineIndent', 'GlyphSpacing', 'StartIndent', 'EndIndent', 'SpaceBefore',
    'SpaceAfter', 'LetterSpacing', 'Values', 'GridSize', 'GridLeading', 'PointBase', 'BoxBounds', 'TransformPoint0', 'TransformPoint1',
    'TransformPoint2', 'FontSize', 'Leading', 'HorizontalScale', 'VerticalScale', 'BaselineShift', 'Tsume',
    'OutlineWidth', 'AutoLeading',
];

// 该函数实现并无标准依据, 仅供参考
function encodeEngineData(data) {
    let gener = new Gener(1024);
    function writeValue(val, key) {
        function escapeChar8(n) {
            switch (n) {
                case 40: case 41: case 92: gener.u8(92);
            }
            gener.u8(n);
        }

        gener.str(' ');
        switch (typeof val) {
            case "string": 
                gener.str('(');
                gener.u16(0xfeff);
                for (let i = 0; i < val.length; ++i) {
                    var code = val.charCodeAt(i);
                    escapeChar8(code >>> 8 & 0xff);
                    escapeChar8(code & 0xff);
                }
                gener.str(')');
                break;
            case "number": 
                gener.str(key && FLOAT_PROPERTY.indexOf(key) !== -1
                    ? val.toFixed(5) : val.toString());
                break;
            case "boolean":
                gener.str(val);
                break;
            case "object":
                if (Array.isArray(val)) {
                    gener.str('[');
                    if (val.some(n=> typeof n !== "number")) 
                        for (let obj of val) writeValue(obj, key);
                    else if (key === 'RunLengthArray')
                        for (let n of val) gener.str(" "+ n.toString());
                    else for (let n of val) gener.str(" "+ n.toFixed(5));
                    gener.str(']');
                }else {
                    gener.str('<<');
                    for (let k of Object.keys(val)) {
                        gener.str(" /"+ k);
                        writeValue(val[k], k);
                    }
                    gener.str('>>');
                }
        }
    }
    writeValue(data);
    return gener.export();
}

// 读取chars并写入DICTIONARY对象
function serializeChars(chars) {
    let text = "";
    let len = 0;
    let run = DICTIONARY.EngineDict.StyleRun;
    run.RunArray = chars.map(({ char, size, color, font, underline, bold, italic })=> {
        text += char==="\n"? "\r": char;
        len += 1;
        color = [1, ...[].map.call(color, c=> c / 255)];
        color.pop();
        return { StyleSheet: { StyleSheetData: {
            Font: 0,
            FontSize: size,
            FauxBold: bold,
            FauxItalic: italic,
            Underline: underline,
            AutoLeading: true,
            Tracking: 0,
            AutoKerning: true,
            FillColor: { Type: 1, Values: color }
        } } };
    });
    run.RunLengthArray = new Array(len).fill(1);
    DICTIONARY.EngineDict.ParagraphRun.RunLengthArray = [len];
    run.IsJoinable = len;
    DICTIONARY.EngineDict.Editor.Text = text;
    return text;
}

module.exports = (gener, chars, left, top)=> {
    let text = serializeChars(chars);
    gener.u16(1);
    [1,0,0,1, left, top].forEach(n=> gener.f64(n));
    gener.u16(50);
    gener.u32(16);
    generTextDescriptor(gener, text, encodeEngineData(DICTIONARY));
    gener.u16(1);
    gener.u32(16);
    generWrapDescriptor(gener);
    gener.go(32);
};
