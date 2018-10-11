const fetch = require('node-fetch')

const request = (url, options) => fetch(url, options).then(o => o.json())

module.exports = request