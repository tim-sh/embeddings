const { proj } = require('../util/fs')
const { stacks: { maxLen } } = require(proj('data/config'))

function textTransformStacksAndWhitespace(text) {
  let stackLen = 0
  let excludeFromMaxLen = false

  return text.split('\n')
      .map(line => line.trimEnd())
      .filter((line, i, lines) => {
        // empty line: reset
        if (line.trim() === '') {
          stackLen = 0
          excludeFromMaxLen = false
          return false
        }

        // try stack
        let relevant
        [relevant, stackLen, excludeFromMaxLen] = tryStack(line, lines[i - 1], lines[i + 1], stackLen, excludeFromMaxLen)
        if (relevant !== undefined) {
          return relevant
        }

        return true
      })
      .map(line => line.trimStart())
      .filter(Boolean)
      .join('\n')
}

module.exports = {
  textTransformStacksAndWhitespace
}

/**
 * Determines whether the current line is relevant for a stack trace
 * @param line the current line
 * @param prev the previous line
 * @param next the next line
 * @param stackLen the current stack length
 * @param excludeFromMaxLen whether the current line should be excluded from the maximum stack length
 * @return {(boolean|number)[]} quadruple indicating whether the line is relevant, the current stack length, whether the next line should be excluded from the maximum stack length
 */
function tryStack(line, prev, next, stackLen, excludeFromMaxLen) {
  const startsStack = () => /(?:\w*(?:Error|Exception)|Caused\sby|\[cause]):/.test(line) || /^\s*node:internal\//.test(line) && /^\s*throw\s/.test(next)

  if (stackLen === 0 && !startsStack()) {
    // outside of stack trace
    return [undefined, stackLen]
  }

  const irrelevant = /^\s*(?:[}^]$|node:internal\/|throw\s)|^\s*at\s+(?:java\.|sun\.|com\.sun\.|jdk\.)|(?:\bat\s+|\()(?:node:)?internal\/|\.{3}.*\s(cause.*\.{3}|omitted\b)/.test(line)
  const inStack = () => /^\s*(?:[}^]$|at\s|throw\s|\.{3}.*\bcause\b.*\.{3}|)/.test(line)
  const startsProperties = () => /^\s*at\s.*\s\{$/.test(line)
  const endsStack = () => !inStack() || /^\s*}$/.test(prev)

  if (stackLen === 0 || startsStack()) {
    // start of stack trace
    stackLen = 1
    return [!irrelevant, stackLen, false]
  }
  if (endsStack()) {
    // end of stack trace
    stackLen = 0
    return [undefined, stackLen]
  }
  // in stack trace
  const excludeFromMaxLenNext = excludeFromMaxLen || startsProperties()
  if (irrelevant) {
    return [false, stackLen, excludeFromMaxLenNext]
  }
  // relevant stack frame
  return [excludeFromMaxLen || ++stackLen <= maxLen, stackLen, excludeFromMaxLenNext]
}
