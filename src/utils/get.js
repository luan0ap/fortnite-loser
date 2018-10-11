const fetch = require('node-fetch')

const get = url => fetch(url).then(o => o.json())

module.exports = get