
const nodeFetch = require('node-fetch')
const isNode = !!(typeof process !== 'undefined' && process.version);

/* 
hex: 十六进制颜色
rgb: (r, g, b) 
*/


/**
 * 求商与模
 * @param {Number} d 被除数
 * @param {Number} n 除数
 * @returns 
 */
function ds (d, n = 256) {
  const b = d % n
  const a = Math.floor(d / 256)
  return [a, b]
}
/**
 * 将10进制数转换为颜色
 * @param {Number} d 
 * @param {String} outType 输出类型 rgb | hex
 * @returns {Array | String} -> [r, b ,b], other -> 'FFDDFF'
 */
function intToColor(d, outType = 'rgb') {
  if (d > Math.pow(256, 3)) {
    console.warn('多大的值,无法转换', d)
    return [255, 255, 255, 0]
  }
  let [r, g, b] = [0, 0, 0, 0]
  if (d < 256) {
    b = d
  } else {
    [g, b] = ds(d, 256)
    if (g > 255) {
      [r, g] = ds(g, 256)
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

/**
 * 颜色转换为int
 * @param {String || Array } color 
 * @param {String} type 
 * @returns {Number}
 */
function colorToInt (color, type = 'rgb') {
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

function http () {
  if (isNode) {
    return nodeFetch
  } else {
    // eslint-disable-next-line no-undef
    return window.fetch
  }
}

module.exports = {
  http,
  intToColor,
  colorToInt,
  isNode
}
