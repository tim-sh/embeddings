const { createHash } = require('node:crypto')

function rndStr(number) {
  return Math.random().toString(36).substring(2, number + 2)
}

function hashed(str, len = 7) {
  return createHash('sha256').update(str + 'fgVye9TVuNqI').digest('hex').substring(0, len)
}

module.exports = {
  rndStr,
  hashed
}
