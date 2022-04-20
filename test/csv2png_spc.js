const {Csv2png} = require('../index')

const csv = './test/data/sub.csv'

const pc = new Csv2png({
  int: [7, 8, 9, 10],
  filePath: csv,
  width: 400
})

// const r = pc.compile()
// console.log(r)

pc.write('sub')
