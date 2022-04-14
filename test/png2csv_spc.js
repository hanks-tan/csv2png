var fs = require('fs')
var path = require('path')
const pc = require('../png2csv')

const png = 'D:\\tang\\project\\test\\csv2png\\1bg.png'
const config = 'D:\\tang\\project\\test\\csv2png\\ind.json'

pc.png2csv(png, config)
