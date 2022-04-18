function pngToData () {
  const canvas = document.createElement('canvas')
  const ele = document.getElementById('area')
  ele.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.onload = function () {
    canvas.height = img.height
    canvas.width = img.width
    ctx.drawImage(img, 0, 0, width, height)
    const data = ctx.getImageData(0, 0, width, height)
    const url = './ts.json'
    fetch(url).then((res) => {
      return res.json()
    }).then((cf) => {
      parseData(data, cf)
    })
  }
  img.src = './ts.png'
}

function swapMap (map) {
  const newMap = new Map()
  map.forEach((v, k) => {
    newMap.set(v, k)
  })
  return newMap
}

function parseData (pngData, cfJson) {
  const cfObj = cfJson
  const headerMap = new Map(cfObj.header)
  const valueMap = cfObj.values.map((v) => {
    const map = new Map(v)
    return swapMap(map)
  })
  const opt = cfObj.options
  const origin = cfObj.origin

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

      let valueInPix = colorToInt([r, g, b])
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
  }
}

const colorToInt = function (color, type = 'rgb') {
  if (type === 'hex') {
    const r = parseInt(color.slice(0, 2), 16)
    const g = parseInt(color.slice(2, 4), 16)
    const b = parseInt(color.slice(4, 6), 16)
    return r * 256 * 256 + g * 256 + b
  } else if (type === 'rgb') {
    const [r, g, b] = color
    return r * 256 * 256 + g * 256 + b
  }
}

setTimeout(() => {
  pngToData()
}, 2000);