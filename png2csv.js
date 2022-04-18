const fs = require('fs')
const PNG = require('pngjs').PNG
const tran = require('./transoform')

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

function png2csv (png, cf, options) {
  const cfJson = fs.readFileSync(cf)
  const cfObj = JSON.parse(cfJson)
  const headerMap = new Map(cfObj.header)
  const valueMap = cfObj.values.map((v) => {
    const map = new Map(v)
    return swapMap(map)
  })
  const opt = cfObj.options
  const origin = cfObj.origin

  const ws = fs.createWriteStream('ng.csv', {
    flags: 'w'
  })

  const header = []
  headerMap.forEach((v, k) => {
    header.push(v.name)
  })

  ws.write(header.join(',') + '\r\n')

  fs.createReadStream(png)
    .pipe(
      new PNG({
        filterType: -1,
        colorType: 2
      })
    )
    .on('parsed', function () {
      let datas = [] // 点值集合
      for(let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2;
          let r = this.data[idx]
          let g = this.data[idx + 1]
          let b = this.data[idx + 2]

          let valueInPix = tran.colorToInt([r, g, b])
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

        ws.write(lineValues.join(',') + '\r\n')
      }
      ws.close()
    })
}

module.exports = {
  png2csv
}
