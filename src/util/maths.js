function mean(arr) {
  return arr.reduce((sum, x) => sum + x, 0) / arr.length
}

function meanArr(arrOfArr) {
  const dim = arrOfArr[0].length
  return Array.from({ length: dim }, (_, i) => mean(arrOfArr.map(arr => arr[i])))
}

function dot(a, b) {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0)
}

function ascending(a, b) {
  return a - b
}

function descending(a, b) {
  return b - a
}

module.exports = {
  mean,
  meanArr,
  dot,
  ascending,
  descending
}
