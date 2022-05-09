"use strict"
const fs = require('fs')
const utils = require('./utils')
/**
 * png转csv，值针对右csv2png程序转换结果的还原处理。
 * @param {Object} options
 * options属性:
 *  png -> 指定本地png文件地址、网络上的png地址、或者一个包含width(png宽)、height(png高)、data(png二进制流)的对象
 *  config -> 配置，即生成png时同时的json文件内容
 */
const Png2csv = function (options) {
  this._png = options.png
  this._config = options.config
  this._origin = this._config.origin

  this._isNode = !!(typeof process !== 'undefined' && process.version);
  this.header = []
}
Png2csv.prototype.parse = async function () {
  const data = await this._getPngData()
  return this._parsePng(data)
}

Png2csv.prototype._getPngData  = async function () {
  const dataType = typeof this._png
  if (['object', 'string'].includes(dataType)) {
    if (dataType === 'object') {
      if (this._png.width && this._png.height && this._png.data) {
        return this._png
      } else {
        console.warn('png数据对象错误')
      }
    } else {
        // 处理本地文件
        if(fs.existsSync(this._png)){
          const PNG = require('pngjs').PNG
          const data = fs.readFileSync(this._png)
          return PNG.sync.read(data)
        } else {
          // 处理网络文件
          const data = await this._getPngDataInner(this._png)
          return data
        }
      }
    }
  }

// Png2csv.prototype._getPngDataByInner = function () {
//   return new Promise((resolve) => {
//     // eslint-disable-next-line no-undef
//     const canvas = document.createElement('canvas')
//     const ctx = canvas.getContext('2d')
//     // eslint-disable-next-line no-undef
//     const img = new Image()
//     img.onload = function () {
//       const width = img.width
//       const height = img.height
//       canvas.width = width
//       canvas.height = height
//       ctx.drawImage(img, 0, 0, width, height)
//       const data = ctx.getImageData(0, 0, width, height)
//       resolve(data)
//     }
//     img.src = this._png
//   })
// }
Png2csv.prototype._getPngDataInner = async function (src) {
  const http = utils.http()
  const res = await http(src)
  const buf = await res.arrayBuffer()
  return buf
}

Png2csv.prototype._swapMap = function (map) {
  const newMap = new Map()
  map.forEach((v, k) => {
    newMap.set(v, k)
  })
  return newMap
}

Png2csv.prototype._parseConifg = function (configData) {
    const headerMap = new Map(configData.header)
    const valueMap = configData.values.map((v) => {
      const map = new Map(v)
      return this._swapMap(map)
    })

    const header = []
    headerMap.forEach((v, k) => {
      header.push(v.name)
    })

    this.header = header
    return {
      header:headerMap,
      values:valueMap
    }
  }

Png2csv.prototype._parsePng = function(pngData) {
  let datas = [] // 点值集合
  for(let y = 0; y < pngData.height; y++) {
    for (let x = 0; x < pngData.width; x++) {
      let idx = (pngData.width * y + x) << 2;
      let r = pngData.data[idx]
      let g = pngData.data[idx + 1]
      let b = pngData.data[idx + 2]

      let valueInPix = utils.colorToInt([r, g, b])
      datas.push(valueInPix)
    }
  }

  // 配置解码
  const {header,values}= this._parseConifg(this._config)
  const colsTypes = []
  const stringCols = []
  header.forEach((v, k) => {
    colsTypes.push(v.type)
    if (v.type === 'string') {
      stringCols.push(k)
    }
  })
  const stringColsMap = new Map()
  stringCols.forEach((value, i) => {
    stringColsMap.set(value, values[i])
  })

  // 解码
  const {width, height} = this._origin
  const resultList = [this.header]
  for(let y = 0; y < height; y++) {
    const lineIntValues = datas.slice(y * width, (y + 1) * width)
    const lineValues = lineIntValues.map((intV, x) => {
      if (intV === (Math.pow(2, 24) - 1)) {
        return ''
      }
      if (colsTypes[x] === 'string') {
        const thisMap = stringColsMap.get(x)
        const value = thisMap.get(intV)
        return value
      } else if (colsTypes[x] === 'int') {
        return intV.toString()
      } else {
        return intV
      }
    })
    resultList.push(lineValues)
  }
  return resultList
}

module.exports = Png2csv
