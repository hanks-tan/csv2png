
/* 
hex: 十六进制颜色
rgb: (r, g, b) 
*/


const ds = function (d, n = 256) {
  const b = d % n
  const a = Math.floor(d / 256)
  return [a, b]
}
/**
 * 
 * @param {*} d 
 * @param {*} outType 
 * @returns rbg -> [r, b ,b], other -> 'FFDDFF'
 */
function intToRgb(d, outType = 'rgb') {
  let [r, g, b, a] = [0, 0, 0, 0]
  if (d < 256) {
    b = d
  } else {
    [g, b] = ds(d, 256)
    if (g > 255) {
      [r, g] = ds(g, 256)
      if (r > 255) {
        console.log('多大的值,无法转换', d)
        return [255, 255, 255, 0]
      }
    }
  }

  if (outType === 'rgb') {
    return [r, g, b]
  } else {
    return [r, g, b].map((i) => {
      const s = i.toString(16)
      return s.length === 1 ? `0${s}` : s
    }).join('')
  }
}

const rgbToInt = function (color, type = 'rgb') {
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

// const data = [12, 263, 255, 65536]
// data.forEach((d) => {
//   const s = intToRgb(d)
//   console.log(d, s)
//   const t = rgbToInt(s)
//   console.log('返回', t)
// })

module.exports = {
  intToRgb,
  rgbToInt
}
