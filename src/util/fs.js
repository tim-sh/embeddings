const { dirname, resolve } = require('path')

const projRoot = resolve(__dirname, '../..')

function fromHere(...paths) {
  const stack = new Error().stack
  const match = (stack.split('\n'))[2].match(/\(([^()]+)\)| at ([^()]+)$/)
  const caller = (match[1] ?? match[2])?.replace(/^file:\/\/|(:\d+)+$/, '')
  return resolve(dirname(caller), ...paths)
}

function proj(...paths) {
  return resolve(projRoot, ...paths)
}

module.exports = {
  fromHere,
  proj
}
