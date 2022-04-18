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
    img.onload = function () {
      const data =ctx.drawImage(img, 0, 0, 400, 56)
      resolve(data)
    }
    img.src = pngURl
  })
}

exports.png2csv = function (png, config, options) {
  let pngData
  if (utils.isNode) {
    const fs = require('fs')
    const PNG = require('pngjs').PNG
    const data = fs.readFileSync(png)
    pngData = PNG.sync.read(data)
  } else {
    // TODO ,test
    pngData = getImgData(png)
  }
  return parseData(pngData, config)
}

// exports.png2csv = function (png, cf, outFp, options) {
//   if (utils.isNode) {

//   } else {

//   }
//   // 读取配置
//   const cfJson = fs.readFileSync(cf)
//   const cfObj = JSON.parse(cfJson)
//   const headerMap = new Map(cfObj.header)
//   const valueMap = cfObj.values.map((v) => {
//     const map = new Map(v)
//     return swapMap(map)
//   })
//   const opt = cfObj.options
//   const origin = cfObj.origin

//   const ws = fs.createWriteStream(outFp, {
//     flags: 'w'
//   })

//   const header = []
//   headerMap.forEach((v, k) => {
//     header.push(v.name)
//   })

//   ws.write(header.join(',') + '\r\n')

//   // 先配置解析
//   const colsTypes = []
//   const stringCols = []
//   headerMap.forEach((v, k) => {
//     colsTypes.push(v.type)
//     if (v.type === 'string') {
//       stringCols.push(k)
//     }
//   })

//   const stringColsMap = new Map()
//   stringCols.forEach((value, i) => {
//     stringColsMap.set(value, valueMap[i])
//   })
  

//   // 读取图片
//   const data = fs.readFileSync(png)
//   const thisPng = PNG.sync.read(data)

//   let datas = [] // 点值集合
//   for(let y = 0; y < thisPng.height; y++) {
//     for (let x = 0; x < thisPng.width; x++) {
//       const idx = (thisPng.width * y + x) << 2;
//       let r = thisPng.data[idx]
//       let g = thisPng.data[idx + 1]
//       let b = thisPng.data[idx + 2]

//       let valueInPix = tran.colorToInt([r, g, b])
//       datas.push(valueInPix)
//     }
//   }

//   // 解码
//   const width = origin.width
//   for(let y = 0; y < origin.height; y++) {
//     const lineIntValues = datas.slice(y * width, (y + 1) * width)
//     const lineValues = lineIntValues.map((intV, x) => {
//       if (intV === (Math.pow(2, 24) - 1)) {
//         return ''
//       }
//       if (colsTypes[x] === 'string') {
//         const thisMap = stringColsMap.get(x)
//         const value = thisMap.get(intV)
//         return value
//       } else if (colsTypes[x] === 'int') {
//         return intV.toString()
//       } else {
//         return intV
//       }
//     })

//     ws.write(lineValues.join(',') + '\r\n')
//   }
//   ws.close()
//   console.log('done!')
// }
