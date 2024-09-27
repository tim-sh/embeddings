const { proj } = require('../util/fs')
const { stacks: { maxLen } } = require(proj('data/config'))

function handleStack(line, stackLen) {
  if (stackLen === 0) {
    if (/(?:\w*(?:Error|Exception)|Caused by):/.test(line)) {
      stackLen++
    }
    return [true, stackLen, false]
  }
  if (! /^\s*at\s+/.test(line)) {
    stackLen = 0
    return [true, stackLen, false]
  }
  const irrelevant = /^\s*at\s+(?:java\.|sun\.|com\.sun\.|jdk\.)|(?:\bat\s+|\()(?:node:)?internal\//
      .test(line)
  if (irrelevant) {
    return [false, stackLen, true]
  }
  const inLimits = ++stackLen <= maxLen
  return [inLimits, stackLen, true]
}

function deleteIrrelevantText(text) {

  let stackLen = 0

  return text.split('\n')
      .filter(l => {
        let relevant, finished
        [relevant, stackLen, finished] = handleStack(l, stackLen)
        if (finished) {
          return relevant
        }

        if (/\bnode:internal\//.test(l)) {
          return false
        }

        return relevant
      })
      .join('\n')
}

module.exports = {
  deleteIrrelevantText
}
