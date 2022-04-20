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
```js
const {Csv2png} = require('../index')

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