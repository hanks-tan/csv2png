const fs = require('fs')
const png2csv = require('../lib/png2csv')

const png = './test/data/sub.png'
const config = './test/data/sub.json'

const cf = fs.readFileSync(config)
const data = JSON.parse(cf)
const opt = {
  png,
  config: data
}
const pc = new png2csv(opt)
pc.parse().then((data) => {
  console.log('header',data[0])
})
