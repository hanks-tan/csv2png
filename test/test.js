

function pngToData () {
  const url = './data/sub.json'
  const png = './data/sub.png'
  // eslint-disable-next-line no-undef
  fetch(url).then((res) => {
    return res.json()
  }).then((data) => {
    const opt = {
      png,
      config: data
    }
    // eslint-disable-next-line no-undef
    const pc = new png2csv(opt)
    pc.parse().then((data) => {
      // eslint-disable-next-line no-undef
      const ele = document.getElementById('content')
      const top3 = data.slice(0, 3)
      ele.innerText = top3.join('\r\n')
    })
  })
}

setTimeout(() => {
  pngToData()
}, 100)