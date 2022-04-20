"use strict"

const utils = require('./utils')
const Png2csv = function (options) {
  this._png = options.png
  this._config = options.config
  this._configOptions = this._config.options
  this._origin = this._config.origin

  this._isNode = !!(typeof process !== 'undefined' && process.version);
  this.header = []
  this._pngData = this._getPngData()
}
Png2csv.prototype.parse = function () {
  if (this._pngData instanceof Promise) {
    return this._pngData.then((data) => {
      return this._parsePng(data)
    })
  } else {
    if (this._pngData.width && this._pngData.height && this._pngData.data) {
      return this._parsePng(this._pngData)
    } else {
      console.log('未获取到png', this._pngData)
    }
  }
}

Png2csv.prototype._getPngData  = async function () {
  if (this._isNode) {
    const fs = require('fs')
    const PNG = require('pngjs').PNG
    const data = fs.readFileSync(this._png) // 只是本地，//TODO 网络上的
    return PNG.sync.read(data)
  } else {
    const data = await this._getPngDataByInner()
    console.log(this._pngData)
    return data
  }
}

Png2csv.prototype._getPngDataByInner = function () {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    // eslint-disable-next-line no-undef
    const img = new Image()
    img.onload = function () {
      const width = img.width
      const height = img.height
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      const data = ctx.getImageData(0, 0, width, height)
      resolve(data)
    }
    img.src = this._png
  })
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
