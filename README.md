# csv2png

## 功能
提供将csv压缩成png图片的功能，以及将压缩后的png还原成csv文件。

# 模块
|名称         |浏览器    |Node     |
|:-----------:|:--------:|:------:|
|csv2png      |不支持    |支持     |
|png2csv      |支持      |支持     |

# 用法
## 1. csv2png类
### 1) 初始化

*options*
|参数名             |类型           |是否必须   |默认值           | 描述              |
|:------------------|:--------------|:----------|:----------------|:-----------------|
|data               |String 或 Array<Array<String>>     |可选       |                |csv字符串或者一个二维数组        |
|filePath           |String         |可选       |                |本地csv文件地址。如果给了dataStr，则忽略这个参数。|
|int                |Array          |可选       |                |指定数据类型为int的列，数组中每一项对应列的序号，从零开始。不提供将默认所以列都字符串。|
|sep                |String         |可选       |,               |指定csv数据的分隔符。|
|lf                 |String         |可选       |\r\n            |指定csv数据的换行符。|
|width              |Num            |可选       |csv的列数        |指定转出后图片的宽度 。可以只指定宽度而不提供高度。必须大于0 |
|height             |Num            |可选       |csv的行数（除去首行）|指定转出后图片的高度。必须大于0|

**注意：csv数据第一列必须是字段名列。**

- 初始化时传入csv字符串 
```js
const {Csv2png} = require('csv2png')

const csv = 'id,name,year,sex; 1,tom, 13, man;2, alic, 15, women;'
const pc = new Csv2png({
  data: csv,
  int: [2],
  lf: ';'
})
```

- 初始化一个处理本地文件的类
```js
const {Csv2png} = require('csv2png')

const csv = '/data/sub.csv'
const pc = new Csv2png({
  int: [7, 8, 9, 10],
  filePath: csv,
  width: 400
})
```
### 2) 实例方法
- compile  
  输入一个包含转换结果的对象

- write(name)  
  转换结果写入文件,name.png，name.json

### 3) 用法示例
```js
const {Csv2png} = require('csv2png')

const csv = '/data/sub.csv'

const pc = new Csv2png({
  int: [7, 8, 9, 10],
  filePath: csv,
  width: 400
})

const r = pc.compile()
console.log(r)
```

*输出*
```js
{imgData: {…}, config: {…}}
```
-------------------------
## 2.png2csv类
### 1) 初始化
*options*
|参数名             |类型           |是否必须   |默认值           | 描述              |
|:------------------|:-------------|:----------|:----------------|:-----------------|
|png                |String 或 Object|是         |                 |png本地地址或网络地址，或者是一个包含width(png宽)、height(png高)、data(png二进制流)的对象|
|config             |Object        |是         |                 |生成png时同步产地的config对象|
### 2) 实例方法
  - parse 异步方法  
  解析png，返回二维数组，数组中每一项对应原csv的每一列

### 3) 用法示例
```js
const fs = require('fs')
const png2csv = require('../lib/png2csv')

const png = './test/data/sub.png'
const config = './test/data/sub.json'

const cf = fs.readFileSync(config)
const data = JSON.parse(cf)
const opt = {
  png,
  config: data
}
const pc = new png2csv(opt)
pc.parse().then((data) => {
  console.log(data[0])
})
```
*输入*
```js
['date', 'country', 'countryCode', ...]
```
