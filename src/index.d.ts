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
    
interface TextInfo<Char> {
    transform: TransformMatrix, 
    /**
     * 文本的杂项信息, 可靠但不实用
     */
    raw: Object, 
    chars: Char[]
}

type TransformMatrix = Float64Array & { byteLength: 6 };

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
        text?: TextInfo<TextInfoChar>, 
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
    
    interface TextInfoChar {
        /**
         * 单个字符
         */
        char: string,
        /**
         * `[R, G, B, A]`颜色, 数字范围`0~255`
         */
        color: Uint8Array,
        /**
         * `Postscript` 字体名称, 不可直接用于`font-family`
         * 
         * 可能需要[`queryLocalFonts`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/queryLocalFonts)函数来辅助转换
         */
        font: string, 
        /**
         * 字体大小, 可用于`font-size`, 可能是浮点数
         */
        size: number, 
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

/**
 * 解析一个PSD文件
 * @param buf 可以是Uint8Array或ArrayBuffer
 */
export declare function parse(buf: Uint8Array | Buffer | ArrayBuffer): Parser.PSD;

/**
 * 从网络fetch PSD文件并解析
 * @param url 网络链接, 将传进fetch的第一个参数
 */
export declare async function parseUrl(url: string): Promise<Parser.PSD>;

namespace Gener {
    declare interface PSD {
        width: number, 
        height: number, 
        layers: Layer[], 
    }
    
    declare interface Layer {
        left?: number = 0, 
        top?: number = 0, 
        /**
         * 若不提供width则自动使用父元素宽度
         * 
         * `image`的大小仍需保证是`width * height * 4`
         */
        width?: number, 
        /**
         * 若不提供height则自动使用父元素高度
         * 
         * `image`的大小仍需保证是`width * height * 4`
         */
        height?: number, 
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
        image?: Uint8Array | Uint8ClampedArray, 
        /**
         * 文本图层独有的属性, 包含了每个字符的样式
         */
        text?: TextInfo<TextInfoChar>, 
    }
    
    interface TextInfoChar {
        /**
         * 单个字符. 
         */
        char: string,
        /**
         * `[R, G, B, A]`颜色, 数字范围`0~255`
         * 
         * 只读取`Red`, `Green`和`Blue`. `Alpha`将被忽略.
         * 
         * 缺省值为`[0, 0, 0, 255]`
         */
        color?: Iterable<Uint8>,
        /**
         * !暂未实装!
         * 
         * 该位置需要的是`Postscript`字体名称, 和`font-family`的值并不同. 
         * 
         * 可能需要[`queryLocalFonts`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/queryLocalFonts)函数来辅助转换. 
         */
        font?: string, 
        /**
         * 字体大小, 和`font-size`的比例一致, 可以是浮点数. 
         */
        size?: number = 16, 
        /**
         * 是否有下划线
         */
        underline?: boolean = false,
        /**
         * 是否粗体
         */
        bold?: boolean = false,
        /**
         * 是否斜体
         */
        italic?: boolean = false
    }
}

/**
 * 通过一个PSD对象生成PSD文件
 * 
 * 最小的psd对象可以是: 
 * 
 * ```js
 * let psd = { width: 16, height: 16, layers: [ {} ] };
 * keypsd.gener(psd);
 * ```
 * 
 * 你也可以传入一个图像数据(通常由`canvas.getContext("2d").getImageData(..)`得到)直接将其转为psd: 
 * 
 * ```js
 * ...
 * let data = context.getImageData(0, 0, 16, 16).data;
 * let psd = { width: 16, height: 16, layers: [{
 *     name: "新图层",
 *     image: data
 * }] };
 * keypsd.gener(psd);
 * ```
 * 
 * - `name`: 字符串, 代表图层名称. 
 * - `image`: `image`的长度必须是**图层**的`width * height * 4`. 如果未指定图层的`width`和`height`, 将缺省为`PSD`文件本身的`width`和`height`. 
 * 
 * 对于图层对象, 除了`name`和`image`, 你还可以指定: 
 * 
 * - `left`和`top`: 用于定位图层, 一个有符号整数. 默认值是`0`. 
 * - `width`和`height`: 必须是正整数, 且`image`的大小必须是`width * height * 4`. 默认值是psd对象下的`width`和`height`. 
 * - `visible`: 布尔值, 表示是否隐藏图层(对应图层栏左侧的小眼睛按钮). 默认是 `true`. 
 * - `blendMode`: 字符串, 必须是CSS [`mix-blend-mode`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mix-blend-mode) 的16个属性中的一个. 
 * - `opacity`: `0 ~ 255`之间的整数之一(包括`0`和`255`), 代表图层的透明度. 默认是 `255`. 
 * - `folder`: 必须是"open"或者"close", 代表新图层组和关闭图层组. 就像XML一样, 一个图层组需要两个带有`folder`标志的图层来表示图层组的包含关系, 支持嵌套. 默认值是`undefined`. 
 * 
 * @param psd psd对象
 */
export declare function gener(psd: Gener.PSD): Uint8Array;

/**
 * 从一个数据**作为图片**生成PSD文件. 
 * 
 * 支持以下类型: 
 * 
 * - `string`: 将其作为链接, `fetch`资源作为图片生成PSD文件. 
 * - `Uint8Array` | `Blob`: 将其作为图像, 解析并生成PSD文件. 
 * - `HTMLImageElement`: 为该图像生成PSD文件(写入`src`即可传入, 不需要等待`onload`). 
 * - `HTMLCanvasElement`: 将该画布的图像作为数据源, 生成PSD文件. 
 * 
 * @param src 数据源
 */
export declare async function generFrom(src: string | Uint8Array | Blob | HTMLImageElement | HTMLCanvasElement): Promise<Uint8Array>;
