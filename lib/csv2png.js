const fs = require('fs')
const PNG = require('pngjs').PNG
const utils = require('./utils')

/**
 * 
 * @param {Object} options 
 * options属性:
 *  data -> csv字符串或者数组
 *  filePath -> 本地文件地址
 *  lf -> 换行符， 默认'\r\n' 
 *  sep -> 分隔符， 默认',' 
 *  int -> 指定int类型的列，Array, e.g: [1, 3, 4] 表示第2、4、5列类型为int
 *  width -> 指定转出后图片的宽度
 */
const Csv2png = function (options) {
  this._options = options
  this._csvData = options.data || '' // csv字符串 或者 csv数据列表
  this._fp = options.filePath // csv本地文件路径
  this._lf = options.lf || '\r\n' // 换行符
  this._sep = options.sep || ',' // 分隔符
  this._intCols = options.int // 指定int类型的列，Array, e.g: [1, 3, 4] 表示第2、4、5列类型为int

  this._origin = {width: 0, height: 0} // 原生宽高配置
  if (!this._csvData) {
    this._getCsvData(options.csv)
  }
}

/**
 * 执行编译
 * @returns {Object} 
 */
Csv2png.prototype.compile = function () {
  if (this._csvData) {
    return this._decode(this._csvData)
  }
}

/**
 * 写成文件
 * @param {*} fileName 会同时写fileName.png 和 fileName.json
 * @returns {Boolean} 真代表写入完成
 */
Csv2png.prototype.write = function (fileName) {
  if (this._csvData) {
    const {imgData, config} = this._decode(this._csvData)
    this._writePng(imgData, fileName)
    this._writeJson(config, fileName)
  }
}

Csv2png.prototype._getCsvData = function () {
  if (utils.isNode && this._fp) {
    this._csvData = fs.readFileSync(this._fp, 'utf-8')
  }
}

// Csv2png.prototype._getCsvDataInNet = async function () {
//   let fetch
//   if (utils.isNode) {
//     fetch = require('node-fetch')
//   } else {
//     // eslint-disable-next-line no-undef
//     fetch = window.fetch
//   }
//   const csvData = await fetch(this._options.src)
//   return csvData
// }

Csv2png.prototype._decode = function (csvData) {
  const lines = csvData instanceof Array ? csvData : csvData.split(this._lf)
  const header = lines[0].split(this._sep)
  const content = lines.slice(1)

  const headerMap = new Map() // key: index, value: type
  header.forEach((item, i) => {
    const colType = this._intCols.includes(i) ? 'int' : 'string'
    headerMap.set(i, {name: item, type: colType})
  })

  return this._decodeInner(content, headerMap)
}

Csv2png.prototype._decodeInner = function (content, headerMap) {
  const allColsTypeList = [] // 所有列类型
  const stringColsIndexList = [] // 字符串列的索引
  headerMap.forEach((v, k) => {
    allColsTypeList.push(v.type)
    if (v.type === 'string') {
      stringColsIndexList.push(k)
    }
  })

  // 字符串列值映射
  const valueMap = stringColsIndexList.map(() => {
    return new Map()
  })

  this._origin.width = headerMap.size
  this._origin.height = content.length

  let [width, height] = this._getWidthHeight(this._origin.width, this._origin.height)

  let inBuf = new Uint8ClampedArray(width * height * 4)

  let colorIndex = 0
  content.forEach((line) => {
    const lineValues = line.split(this._sep)
    // 构造字符串列的值索引
    stringColsIndexList.forEach((k, j) => {
      const value = lineValues[k]
      if (value === '') {
        return
      }
      const colMap = valueMap[j]
      if (colMap.get(value) === undefined) {
        colMap.set(value,colMap.size)
      }
    })

    // 编译
    lineValues.forEach((v, j) => {
      let color
      if (v === '') {
        color = [255, 255, 255]
      } else {
        let index = 0
        if (allColsTypeList[j] === 'string') {
          index = valueMap[j].get(v)
        } else if (allColsTypeList[j] === 'int') {
          index = parseInt(v)
        } else {
          // TODO 后续增加其它类型编译
        }
        color = utils.intToColor(index)
      }
      
      color.push(255) // rbga的a
      color.forEach((c) => {
        inBuf[colorIndex] = c
        colorIndex++
      })
    })
  })

  const imgData = {
    data: inBuf,
    width,
    height,
  }

  const config = this._getConf(headerMap, valueMap)

  return {
    imgData,
    config
  }
}

Csv2png.prototype._getConf = function (headerMap, valueMap) {
  const cf = this._compeInfo(headerMap, valueMap)
  cf.options = this._options
  cf.origin = this._origin
  return cf
}

Csv2png.prototype._writePng = function (imgData, name) {
  const opt = {colorType: 2}
  const buf = PNG.sync.write(imgData, opt)
  fs.writeFileSync(`${name}.png`, buf)
}

Csv2png.prototype._writeJson = function (obj, name) {
  const json = JSON.stringify(obj)
  fs.writeFileSync(`${name}.json`, json)
}

/**
 * 计算图片宽高
 * @param {Number} colCount 
 * @param {Number} rowCount 
 * @returns {Array} [w, h, o]
 */
Csv2png.prototype._getWidthHeight = function(colCount, rowCount) {
  let who = [colCount, rowCount, 0]
  // options中指定了宽度
  if (this._options.width) {
    // options中指定了高德
    if (this._options.height) {
      let out = colCount * rowCount - this._options.width * this._options.height
      who = [this._options.width, this._options.height, out]
    } else {
      who = this._fixedWidth(this._options.width, colCount, rowCount)
    }
  } 
  return who
}

/**
 * 根据固定宽度求高度
 * @param {*} width 
 * @param {*} originWidth 
 * @param {*} originHeight 
 * @returns 
 */
Csv2png.prototype._fixedWidth = function (width, originWidth, originHeight) {
  const area = originWidth * originHeight
  const height = Math.floor(area / width) + 1
  const out = width * height - area
  return [width, height, out]
}


/**
 * 把头部和值Map转换成对象
 * @param {*} header 
 * @param {*} value 
 * @returns 
 */
Csv2png.prototype._compeInfo = function (header, value) {
  const info = {}
  info.header = Array.from(header)

  const valueArr = value.map((v) => {
    return Array.from(v)
  })
  info.values = valueArr
  return info
}

// function resovleNum (num) {
//   let start = Math.floor(Math.sqrt(num))
//   let fo = num / start
//   while (Math.floor(fo) !== fo) {
//     start = start - 1
//     fo = num / start
//     if (start === 1) {
//       break
//     }
//   }
//   console.log('结果',num, start, fo)
// }

module.exports = Csv2png