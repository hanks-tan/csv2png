const utils = require('./utils')
/**
 * 交换Map对象的键值
 * @param {Map} map 
 */
function swapMap (map) {
  const newMap = new Map()
  map.forEach((v, k) => {
    newMap.set(v, k)
  })
  return newMap
}

function parseData (pngData, configData) {
  const headerMap = new Map(configData.header)
  const valueMap = configData.values.map((v) => {
    const map = new Map(v)
    return swapMap(map)
  })
  const opt = configData.options
  const origin = configData.origin

  const header = []
  headerMap.forEach((v, k) => {
    header.push(v.name)
  })

  let datas = [] // 点值集合
  for(let y = 0; y < pngData.height; y++) {
    for (let x = 0; x < pngData.width; x++) {
      var idx = (pngData.width * y + x) << 2;
      let r = pngData.data[idx]
      let g = pngData.data[idx + 1]
      let b = pngData.data[idx + 2]

      let valueInPix = utils.colorToInt([r, g, b])
      datas.push(valueInPix)
    }
  }

  // 配置解码
  const colsTypes = []
  const stringCols = []
  headerMap.forEach((v, k) => {
    colsTypes.push(v.type)
    if (v.type === 'string') {
      stringCols.push(k)
    }
  })

  const stringColsMap = new Map()
  stringCols.forEach((value, i) => {
    stringColsMap.set(value, valueMap[i])
  })

  // 解码
  const width = origin.width
  const resultList = []
  for(let y = 0; y < origin.height; y++) {
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

function getImgData (pngURl) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = '*'
    img.onload = function () {
      const width = img.width
      const height = img.height
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      const data = ctx.getImageData(0, 0, width, height)
      resolve(data)
    }
    img.src = pngURl
  })
}

exports.png2csv = function (png, config, options) {
  if (typeof process !== 'undefined') {
    const fs = require('fs')
    const PNG = require('pngjs').PNG
    const data = fs.readFileSync(png)
    const pngData = PNG.sync.read(data)
    return parseData(pngData, config)
  } else {
    import('./utils').then((utils) => {
      getImgData(png).then((data) => {
        return parseData(data, config)
      })
    })
  }
}
