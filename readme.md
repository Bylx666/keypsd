# PSD工具

支持PSD解析和PSD生成. 

解析和生成均暂不支持: 
- RGB以外的色彩模式
- 16/32位深度图像
- Zip压缩格式下的图像数据. 
- 绘制图层, 文本图层之外的图层
- 蒙版

## 图层顺序

你需要特别注意, 解析得到的图层的顺序, 在Photoshop的图层栏中是**从下向上**排列的. 

如果你需要从上向下渲染图层, 则为`layers`属性调用[`Array.prototype.reverse()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)方法. 

## 使用

以下实例中, 直接将解析的结果的对象作为参数, 重新生成了新的`psd`. 

你可能会担心你并没有那么多数据用来作为生成`psd`的参数, 但事实上传入生成`psd`的函数的参数要求十分宽松, 见[数据](#数据). 

### Nodejs

```js
// 引入parse和gener函数
// parse: Parse 解析, gener: Generator 生成
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
// parse(gened.buffer);
// ...
```

## 数据

以下是demo数据, 仅供直观化参考. 

具体数据类型和使用请参见[`index.d.ts`](/src/index.d.ts). 

```js
```

## 编译
