# csv2png

## 功能
提供将csv压缩成png图片的功能，以及将压缩后的png还原成csv文件。

# 模块
|名称         |浏览器    |Node     |
|:-----------:|:--------:|:------:|
|csv2png      |不支持    |支持     |
|png2csv      |支持      |支持     |

# 用法
## 1. csv2png
**e.g**
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

输出
```js
{imgData: {…}, config: {…}}
```

**方法**
- compile
  输入一个包含转换结果的对象
- write(name)
  转换结果写入文件,name.png，name.json

## 2.png2csv
**e.g**
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
输入
```js
['date', 'country', 'countryCode', ...]
```
**方法**
1. parse 异步方法
解析png，返回二维数组，数组中每一项对应原csv的每一列