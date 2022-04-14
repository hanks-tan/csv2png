var fs = require('fs')
var path = require('path')
const pc = require('../png2csv')

const csv = 'D:\\tang\\project\\test\\csv2png\\data\\sub.csv'
const csvData = fs.readFileSync(csv, 'utf-8')

const options = {
  int: [7, 8, 9, 10],
  width: 400
}
pc.csv2png(csvData, options)

