var fs = require('fs')
const PNG = require('pngjs').PNG
const tran = require('./transoform')

/**
 * 
 * @param {String} csvData 
 * @param {Object} options {int:[2,4,5],autoWidth: true} start: 0
 */
function csv2png (csvData, options) {
  const lf = '\r\n'
  const sep = ','
  const colorType = 2 // 3 - rgb 表示, 4 -rgba 表示 
  const lines = csvData.split(lf)
  const header = lines[0].split(sep)
  const content = lines.slice(1)

  let width = header.length
  let height = content.length
  let out = 0
  const origin = {
    width,
    height,
  }

  const headerMap = new Map() // key: index, value: type
  header.forEach((item, i) => {
    headerMap.set(i, {name: item, type: 'string'})
  })

  if (options) {
    Object.keys(options).forEach((key) => {
      if (key === 'int') {
        const intCols = options[key]
        intCols.forEach((item) => {
          headerMap.get(item).type = 'int'
        })
      }
    })
  } else {
    autoScanField(content)
  }

  // 根据指定的宽度自动计算高度
  // TODO 可以同时配置高度，用来截取数据
  if (options.width) {
    [width, height, out] = fixedWidth(options.width, width, height)
  }

  const colsTypes = []
  const stringCols = []
  headerMap.forEach((v, k) => {
    colsTypes.push(v.type)
    if (v.type === 'string') {
      stringCols.push(k)
    }
  })
  console.log('列', colsTypes)

  const valueMap = stringCols.map((i) => {
    return new Map()
  })

  let png = new PNG({
    width: width,
    height: height,
    filterType: -1,
    colorType: 2
  })

  let colorIndex = 0
  content.forEach((line,i) => {
    const lineValues = line.split(sep)
    // 构造值索引
    stringCols.forEach((k, j) => {
      const value = lineValues[k]
      if (value === '') {
        return
      }
      const thisMap = valueMap[j]
      if (thisMap.get(value) === undefined) {
        thisMap.set(value,thisMap.size)
      }
    })

    // 编译
    lineValues.forEach((v, j) => {
      let color
      if (v === '') {
        color = [255, 255, 255]
      } else {
        let index = 0
        if (colsTypes[j] === 'string') {
          index = valueMap[j].get(v)
        } else if (colsTypes[j] === 'int') {
          index = parseInt(v)
        } else {
          // TODO 后续增加其它类型编译
        }
        color = tran.intToColor(index)
      }
      
      color.push(255)
      color.forEach((c) => {
        png.data[colorIndex] = c
        colorIndex++
      })
    })
  })

  png
  .pack()
  .pipe(fs.createWriteStream('1bg.png'))
  .on('finish', function() {
    console.log('写入完成', colorIndex)
  })

  const cf = compeInfo(headerMap, valueMap)
  cf.options = options
  cf.origin = origin // 原生宽高配置
  const json = JSON.stringify(cf)
  fs.writeFile('./ind.json', json, () => {
    console.log('写完配置')
  })
}

function autoScanField(data) {

}

/**
 * 把头部和值Map转换成对象
 * @param {*} header 
 * @param {*} value 
 * @returns 
 */
function compeInfo (header, value) {
  const info = {}
  info.header = Array.from(header)

  const valueArr = value.map((v) => {
    return Array.from(v)
  })
  info.values = valueArr
  return info
}

function resovleNum (num) {
  let start = Math.floor(Math.sqrt(num))
  let fo = num / start
  while (Math.floor(fo) !== fo) {
    start = start - 1
    fo = num / start
    if (start === 1) {
      break
    }
  }
  console.log('结果',num, start, fo)
}

/**
 * 根据固定宽度求高度
 * @param {*} width 
 * @param {*} originWidth 
 * @param {*} originHeight 
 * @returns 
 */
function fixedWidth(width, originWidth, originHeight) {
  const area = originWidth * originHeight
  const height = Math.floor(area / width) + 1
  const out = width * height - area
  return [width, height, out]
}

module.exports = {
  csv2png
}