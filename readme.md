# PSD工具

支持PSD解析和PSD生成. 

解析和生成均暂不支持: 
- RGB以外的色彩模式
- 16/32位深度图像
- Zip压缩格式下的图像数据. 
- 绘制图层(正常图层)和文本图层之外类型的图层
- 蒙版

本文档开篇列举了基本API的使用示例, 若你希望直接阅读`PSD`的解析结果来考虑该框架的解析能力是否适合你的需求, 请直接跳至[数据](#数据). 

## 图层顺序

你需要特别注意, 解析得到的图层的顺序, 在Photoshop的图层栏中是**从下向上**排列的. 

如果你需要从上向下渲染图层, 则为图层列表`layers`属性调用[`Array.prototype.reverse()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)方法. 

## 使用

`keypsd`共提供了`4`个方法供使用: `parse`, `parseFrom`, `gener`, `generFrom`. 

- `parse`: 传入`ArrayBuffer`或`Uint8Array`, 将其作为`PSD`数据进行解析. 
- `gener`: 传入存有`PSD`数据的对象, 返回`Uint8Array`作为生成的`PSD`文件. `gener`是`generate`的缩写. 
- `parseFrom`, `generFrom`: `parse`和`gener`的**异步**版本, 支持多种格式(见下文). 

其中`parseFrom`和`generFrom`只支持浏览器端. 

### Nodejs

以下示例直接将解析的结果的对象作为参数, 重新生成了新的`psd`. 

```js
// 引入parse和gener函数
// parse: Parse 解析, gener: Generate 生成
const { parse, gener } = require("keypsd");
const { readFileSync, writeFileSync } = require("fs");

// 读取psd文件并解析
let file = readFileSync("./src/test/temp.psd");
// parse接受Uint8Array, Buffer或ArrayBuffer
let result = parse(file);
// 递归显示解析结果
console.dir(result, { depth: null });

// 由测试数据生成PSD文件
let gened = gener(result);
// 写入psd文件, 去文件管理器中打开试试看
writeFileSync("./src/test/write.psd", gened);

// 你可以再次解析生成的数据
// parse(gened);
// ...
```

### 浏览器

以下示例提供了一个上传按钮, 上传PSD文件后解析出的数据会被输出在界面并打印在控制台. 一个下载按钮将允许你下载通过解析的psd对象重新生成的新psd文件. 

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>KEYPSD 示例</title>
</head>
<body>
    <input type="file" name="upload" id="upload" accept=".psd">
    <pre><code id="parse-result"></code></pre>
    <a id="download" href="#">下载生成的新PSD</a>
    <script src="./keypsd.js"></script>
    <script>
        // 先获取元素
        // 上传按钮
        let $upload = document.getElementById("upload");
        // 解析结果显示处
        let $parseResult = document.getElementById("parse-result");
        // 生成的PSD的下载键
        let $download = document.getElementById("download");

        // 为上传按钮绑定事件
        $upload.onchange = async ()=> {
            // 使用全局对象`keypsd`的异步函数`parseFrom`解析该文件
            let psd = await keypsd.parseFrom($upload.files[0]);
            // 打印解析结果
            console.log(psd);
            // 将Uint8Array显示为`Buffer(length)`并显示在`parseResult`元素上
            $parseResult.textContent = JSON.stringify(
                psd, 
                (_, v)=> v instanceof Uint8Array? `Buffer(${v.byteLength})`: v,
                2
            );

            // 由该对象重新创建PSD
            // 此时你可以点击下载键下载
            let newpsd = keypsd.gener(psd);
            $download.download = "generated.psd";
            $download.href = URL.createObjectURL(new Blob([ newpsd ]));
        }
    </script>
</body>
</html>
```

更详细的解析示例, 包括图层图像和文本图层的处理, 参见[index.html](/broswer/index.html). 

### `parseFrom`

`parseFrom`是一个异步方法, 支持传入以下类型: 

1. 字符串

`keypsd`会将字符串作为链接进行`fetch`, 并将结果作为`PSD`文件解析. 

```js
// 获取该链接指向的PSD文件并解析为PSD对象
keypsd.parseFrom("./test.psd")
    // 我们直接将解析结果打印出来
    .then(r=> console.log(r));
```

2. 二进制资源

二进制数据, 包括`Blob`, `Uint8Array`和`ArrayBuffer`, 会被`keypsd`作为`PSD`文件数据解析. 

值得注意的是, `<input type="file">`类型的`HTML`元素中, 其`files[0]`的数据类型为[`File`](https://developer.mozilla.org/zh-CN/docs/Web/API/File).

而`File`类型继承了`Blob`, 可以直接作为`generFrom`的参数. 因此我认为该调用方式对于文件拖拽和文件上传实现十分实用. 

```html
<!-- 绑定文件上传事件 -->
<input type="file" onchange="upload()" accept=".psd">
<script>
    async function upload() {
        // 通过target属性获取当前事件的元素, 并读取文件内容
        let file = event.target.files[0];
        // 传入parseFrom并打印解析结果
        console.log(await keypsd.parseFrom(file));
    }
</script>
```

### `generFrom`

`generFrom`是一个异步方法, 支持传入以下类型: 

1. 字符串: 

`keypsd`会将字符串作为链接进行`fetch()`, 并将其结果作为**图片**转化为PSD文件. 

```js
// 获取该链接指向的图片并为其生成PSD文件
keypsd.generFrom("./test.jpg")
    // 解析生成的PSD文件并将解析结果打印出来
    .then(r=> console.log(keypsd.parse(r)));
```

2. 图像: 

`keypsd`会将该图像直接作为唯一一个图层进行PSD转换. 

值得注意的是你并不需要等待`Image`的`onload`, 只要其`src`设置正确即可. 

由于`PSD`数据来源自`canvas`, 而大部分跨域`Image`会导致`canvas`无法导出图像数据, 因此对图像链接存在跨域限制. 详情见[MDN: 画布污染](https://developer.mozilla.org/zh-CN/docs/Web/HTML/CORS_enabled_image). 

```js
// 创建新的Image元素
let img = new Image();
// 指定图像链接(存在跨域限制)
img.src = "./test.jpg";
// 无需等待img.onload, 直接传入generFrom
keypsd.generFrom(img)
    // 将生成的PSD文件解析并打印
    .then(r=> console.log(keypsd.parse(r)));
```

3. 二进制资源: 

二进制资源包括`Uint8Array`, `ArrayBuffer`和`Blob`, `keypsd`会将其作为`Image`的`src`, 并以图像的模式进行PSD生成. 

值得注意的是, `<input type="file">`类型的`HTML`元素中, 其`files[0]`的数据类型为[`File`](https://developer.mozilla.org/zh-CN/docs/Web/API/File).

而`File`类型继承了`Blob`, 可以直接作为`generFrom`的参数. 因此我认为该调用方式对于文件拖拽和文件上传实现十分实用. 

```js
fetch("./test.jpg")
    // 将fetch结果作为Blob
    .then(response=> response.blob())
    // 解析该Blob对象表达的PSD文件
    .then(blob=> keypsd.generFrom(blob))
    // 为了测试生成的文件的可用性, 将其传入parse再次解析
    .then(r=> console.log(keypsd.parse(r)));
```

4. Canvas

直接将`Canvas`元素的图像作为图层生成PSD文件. 

```html
<canvas width="40" height="40" id="cv"></canvas>
<script>
    let cv = document.getElementById("cv");
    // 在画布上写点东西
    cv.getContext("2d").fillText("2333", 0, 20);
    // 直接将其传入generFrom
    keypsd.generFrom(cv)
        // 解析生成的PSD并打印
        .then(r=> console.log(keypsd.parse(r)));
</script>
```

## 数据

你可能会担心你并没有那么多数据用来作为生成`psd`的参数, 但事实上传入生成`psd`的函数的参数要求十分宽松.

以下是demo数据, 仅供直观化参考. 

具体数据类型和使用请参见[`index.d.ts`](/src/index.d.ts). 

### `parse`结果参考: 

以下`psd`拥有一个图层组, 一个文本图层和一个普通图层. 

`psd`的每个图层组需要两个图层的位置, 因此以下结果中图层数量为4个. 

```js
({
  // 以下三个属性为固定值
  channels: 3,
  depth: 8,
  mode: 'RGB',

  // 正整数width和height
  height: 16,
  width: 16,

  // 图层列表
  layers: [
    {
      // 4个定位用的整数, width和height为正整数. 
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      // 字符串, 作为图层名称
      name: '</Layer group>',
      // 可见性, 就是图层左侧的小眼睛按钮状态
      visible: true,
      // CSS mix-blend-mode的16属性之一, 参见(https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode). 
      blendMode: 'normal',
      // 8位无符号整数(0~255), 代表图层的透明度
      opacity: 255,
      // 通道, 目前必定为id为`-1`到`2`的4个通道, 分别代表argb. 
      channels: [
        { id: -1, dataLen: 0 },
        { id: 0, dataLen: 0 },
        { id: 1, dataLen: 0 },
        { id: 2, dataLen: 0 }
      ],
      // 由photoshop为图层生成的id, 不唯一, 不可靠, 不建议使用. 
      id: 943868237,
      // 只要有这个属性就代表这是一个标记图层组的图层, 只会是"open"和"close"两个值. 
      // 想象带这个属性的图层是一个xml元素, "open"图层就是`<folder>`, "close"图层就是`</folder>`. 
      // 区别在于, 我们往往只显示"open"的图层作为图层组, "close"图层往往不会被显示出来. 
      // 另外, 由于得到的图层顺序是图层栏中从下往上的顺序, 因此你会先遇到"close", 之后才有"open". 
      folder: 'close',
      // 由于该图层只是个标记图层组结束的标志, 并不储存图像, 且width和height都是0
      // 该image属性只会是一个空的Uint8Array. 
      image: Uint8Array(0)
    },
    {
      // 该图层没有folder和text属性, 则是普通的图层, 会有图像信息
      top: 0,
      left: 0,
      width: 16,
      height: 16,
      name: '图层 0',
      visible: true,
      blendMode: 'normal',
      opacity: 255,
      channels: [
        { id: -1, dataLen: 64 },
        { id: 0, dataLen: 256 },
        { id: 1, dataLen: 256 },
        { id: 2, dataLen: 256 }
      ],
      id: 943868237,
      // 一个图层的图像大小必定为**图层**的长乘宽乘4, 代表了其`RGBA`数据
      // 可以直接作为canvas ImageData的数据源
      image: Uint8Array(1024)
    },
    {
      // 该图层是文本图层, 因为它有text属性
      top: 3,
      left: 4,
      width: 9,
      height: 10,
      name: 'a',
      visible: true,
      blendMode: 'normal',
      opacity: 255,
      channels: [
        { id: -1, dataLen: 90 },
        { id: 0, dataLen: 90 },
        { id: 1, dataLen: 90 },
        { id: 2, dataLen: 90 }
      ],
      // text属性描述了该图层包含的文本和样式信息
      text: {
        // 固定6个浮点数, 代表了其变换数据. 参见: 
        // https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setTransform
        transform: Float64Array(6) [
          1,
          0,
          0,
          1,
          3.308916720099315,
          12.438202409238862
        ],
        // psd中对该文字的描述信息, 可用性不高
        raw: {...},
        // 该图层的所有字符
        text: 'a\n', 
        // 字符的样式
        chars: [
          {
            char: 'a',
            // [R, G, B, A]
            // 可以通过`rgb(${color[0]} ${color[1]} ${color[2]})`转成字符串. 
            color: Uint8Array(4) [ 82, 159, 70, 255 ],
            // Postscript字体名, **无法**直接用于`font-family`, 
            // 可能需要`queryLocalFonts`函数来查询其`family`的值
            font: 'MicrosoftJhengHeiUIRegular',
            // 字体大小
            size: 16,
            // 下划线, 粗体, 斜体
            underline: false,
            bold: true,
            italic: true
          },
          {
            char: '\n',
            color: Uint8Array(4) [ 82, 159, 70, 255 ],
            font: 'MicrosoftJhengHeiUIRegular',
            size: 16,
            underline: false,
            bold: true,
            italic: true
          },
          text: 'a\n'
        ]
      },
      id: 943868237,
      // 该文本图层的栅格化数据
      // psd很有可能没有写入该数据, 而是用0填充了长度
      image: Uint8Array(360)
    },
    {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      name: '组 1',
      visible: true,
      blendMode: 'normal',
      opacity: 255,
      channels: [
        { id: -1, dataLen: 0 },
        { id: 0, dataLen: 0 },
        { id: 1, dataLen: 0 },
        { id: 2, dataLen: 0 }
      ],
      id: 943868237,
      // 照应第一个图层
      folder: 'open',
      image: Uint8Array(0)
    }
  ]
})
```

### `gener`参数参考: 

最小的psd对象可以是: 

```js
let psd = { width: 16, height: 16, layers: [] };
keypsd.gener(psd);
```

你也可以传入一个图像数据(通常由`canvas.getContext("2d").getImageData(..)`得到)直接将其转为psd: 

```js
...
let data = context.getImageData(0, 0, 16, 16).data;
let psd = { width: 16, height: 16, layers: [{
    name: "新图层",
    image: data
}] };
keypsd.gener(psd);
```

- `name`: 字符串, 代表图层名称. 
- `image`: `image`的长度必须是**图层**的`width * height * 4`. 如果未指定图层的`width`和`height`, 将缺省为`PSD`文件本身的`width`和`height`. 

对于图层对象, 除了`name`和`image`, 你还可以指定: 

- `left`和`top`: 用于定位图层, 一个有符号整数. 默认值是`0`. 
- `width`和`height`: 图层自身的大小. 必须是正整数. 默认值是PSD文件本身的`width`和`height`. 
- `visible`: 布尔值, 表示是否隐藏图层(对应图层栏左侧的小眼睛按钮). 默认是 `true`. 
- `blendMode`: 字符串, 必须是CSS [`mix-blend-mode`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mix-blend-mode) 的16个属性中的一个. 
- `opacity`: `0 ~ 255`之间的整数之一(包括`0`和`255`), 代表图层的透明度. 默认是 `255`. 
- `folder`: 必须是"open"或者"close", 代表新图层组和关闭图层组. 就像XML一样, 一个图层组需要两个带有`folder`标志的图层来表示图层组的包含关系, 支持嵌套. 默认值是`undefined`. 

## 运行 编译

### 浏览器环境: 

该项目无依赖, 运行`webpack`即可在`broswer`文件夹下生成`keypsd.js`. 

也可以`webpack watch`, 以便在`broswer`文件夹下进行开发和测试. 

### node环境: 

可以直接使用`npm test`, 来运行`src/test/test.js`. 
