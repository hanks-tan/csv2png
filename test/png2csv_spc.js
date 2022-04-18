const fs = require('fs')
const pc = require('../lib/png2csv')

const png = './test/ts.png'
const config = './test/ts.json'

const cf = fs.readFileSync(config)
const r =  pc.png2csv(png, JSON.parse(cf))
console.log(r[0])
