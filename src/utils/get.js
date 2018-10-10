const fetch = require('node-fetch')

export const get = url => fetch(url).then(o => o.json())

module.exports = get