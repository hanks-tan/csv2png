var fs = require('fs')
var path = require('path')
const pc = require('../png2csv')

const png = './1bg.png'
const config = '../ind.json'

pc.png2csv(png, config)
