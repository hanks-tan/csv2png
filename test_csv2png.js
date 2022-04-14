var fs = require('fs')
const PNG = require('pngjs').PNG

const tran = require('./transoform')

const data = fs.readFileSync('./data/Wuhan-2019-nCoV.csv', 'utf-8')
const citys = fs.readFileSync('./data/city.json', 'utf-8')
const citysList = JSON.parse(citys)

function toImg(csvData) {
  var lines = csvData.split('\r\n')
  const dataList = lines.slice(1)

  const dateIndex = 0
  const date = dataList[0].split(',')[0]

  let png = new PNG({
    width: 7 * 40,
    height: dataList.length / 40,
    filterType: -1,
    colorType: 2
  })
  const countryCodeIndex = 2
  const provinceCodeIndex = 4
  const cityCodeIndex = 6
  const g = [countryCodeIndex, provinceCodeIndex, cityCodeIndex]

  let imgData = []
  let gs = 0
  dataList.forEach((line, i) => {
    const values = line.split(',')
    let tree = citysList
    const citys = g.map((item) => {
      const code = values[item]
      if (code && tree) {
        if (tree.length === 0) {
          console.log('子节点为空')
        } else {
          const index = tree.findIndex((t) => t.code === code)
          tree = tree[index]?.children
          const color = tran.intToRgb(index + 1) // 从有颜色开始
          return color
        }
      }
      return [255, 255, 255]
    })
    const data = values.slice(7).map((v) => {
      v = parseInt(v)
      return tran.intToRgb(v)
    })
    const lineDatas = citys.concat(data)
    if (!values[0] === date) {
      dateIndex +=1
      date = values[0]
    }

    lineDatas.push(dateIndex)
    lineDatas.flat(2).forEach((item) => {
      png.data[gs] = item
      gs++
    })
    // const imgLine =r.forEach((i) => {
    //   let pix = '#' + i
    //   imgData.push(pix)
    // })
  })

  png
  .pack()
  .pipe(fs.createWriteStream('bg.png'))
  .on('finish', function() {
    console.log('写入完成')
  })
}


function test () {
  let png = new PNG({
    width: 1000,
    height: 100,
    filterType: -1,
  });
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      let idx = (png.width * y + x) << 2;
      let col = (x < png.width >> 1) ^ (y < png.height >> 1) ? 0xe5 : 0xff;
      png.data[idx] = col;
      png.data[idx + 1] = col;
      png.data[idx + 2] = col;
      png.data[idx + 3] = 0xff;
    }
  }

  console.log(png.data)
  png
    .pack()
    .pipe(fs.createWriteStream('bg.png'))
    .on('finish', function() {
      console.log('写入完成')
    })
}


toImg(data)
// test()