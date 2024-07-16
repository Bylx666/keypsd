type Enumerate<T extends number, R extends number[] = []> = 
    R['length'] extends T ? R[number] : Enumerate<T, [R['length'], ...R]>;
type Uint8 = Enumerate<256>;

declare enum CSSBlendMode {
    Normal = "normal",
    Darken = "darken", 
    Multiply = "multiply", 
    ColorBurn = "color-burn", 
    Lighten = "lighten", 
    Screen = "screen", 
    ColorDodge = "color-dodge", 
    Overlay = "overlay", 
    SoftLight = "soft-light", 
    HardLight = "hard-light", 
    Difference = "difference", 
    Exclusion = "exclusion", 
    Hue = "hue", 
    Saturation = "saturation", 
    Color = "color", 
    Luminosity = "luminosity"
}
    
declare enum FolderOption {
    Open = "open", 
    Close = "close"
}

namespace Parser {
    interface Layer {
        left: number, 
        top: number, 
        width: number, 
        height: number, 
        name: string, 
        visible: boolean, 
        /**
         * 可用于`mix-blend-mode`css属性
         */
        blendMode: CSSBlendMode, 
        /**
         * 透明度
         */
        opacity: Uint8, 
        /**
         * 由photoshop生成的整数, 不唯一且无使用依据, 并不可靠
         */
        id?: number, 
        channels: ChannelMetaData[], 
        /**
         * psd中的组被分成两个独立的图层, 
         * 
         * 像xml一样, `"open"`则是`<folder>`, `"close"`则是`</folder>`
         */
        folder?: FolderOption, 
        /**
         * RGBA数据, 可直接用于`putImageData`
         */
        image: Uint8Array, 
        /**
         * 文本图层独有的属性, 包含了每个字符的样式
         */
        text?: TextInfo, 
    }
    
    interface ChannelMetaData {
        id: ChannelMetaDataId, 
        dataLen: number
    }
    
    declare enum ChannelMetaDataId {
        Alpha = -1, 
        Red = 0, 
        Green = 1, 
        Blue = 2
    }
    
    interface TextInfo {
        transform: TransformMatrix, 
        /**
         * 文本的杂项信息, 可靠但不实用
         */
        raw: Object, 
        chars: []
    }
    
    type TransformMatrix = Float64Array & { byteLength: 6 };
    
    interface TextInfoChar {
        char: 'a',
        /**
         * `[R, G, B, A]`颜色, 数字范围`0~255`
         */
        color: Uint8Array,
        /**
         * `Postscript` 字体名称, 不可直接用于`font-family`
         * 
         * 可能需要[`queryLocalFonts`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/queryLocalFonts)函数来辅助转换
         */
        font: 'MicrosoftJhengHeiUIRegular', 
        /**
         * 字体大小, 可用于`font-size`
         */
        size: 16, 
        /**
         * 是否有下划线
         */
        underline: boolean,
        /**
         * 是否粗体
         */
        bold: boolean,
        /**
         * 是否斜体
         */
        italic: boolean
    }
    
    declare interface PSD {
        channels: 3, 
        width: number, 
        height: number, 
        depth: 8, 
        mode: "RGB", 
        layers: Layer[], 
    }
}

export declare function parse(buf: Uint8Array | Buffer | ArrayBuffer): Parser.PSD;
export declare function parse_url(url: string): Promise<Parser.PSD>;

namespace Gener {
    declare interface PSD {
        width: number, 
        height: number, 
        layers: Layer[], 
    }
    
    declare interface Layer {
        left: number, 
        top: number, 
        width: number, 
        height: number, 
        name?: string = "layer", 
        visible?: boolean = true, 
        blendMode?: CSSBlendMode = "normal", 
        opacity?: Uint8 = 255, 
        /**
         * psd中的组被分成两个独立的图层, 
         * 
         * 像xml一样, `"open"`则是`<folder>`, `"close"`则是`</folder>`
         */
        folder?: FolderOption, 
        /**
         * RGBA数据, 长度必须为`layer.width * layer.height * 4`
         */
        image?: Uint8Array, 
        /**
         * 文本图层独有的属性, 包含了每个字符的样式
         */
        // text?: TextInfo, 
    }
}

export declare function gener(psd: Gener.PSD): Uint8Array;
