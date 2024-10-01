function mean(arr) {
  return arr.reduce((sum, x) => sum + x, 0) / arr.length
}

function meanArr(arrOfArr) {
  const dim = arrOfArr[0].length
  return Array.from({ length: dim }, (_, i) => mean(arrOfArr.map(arr => arr[i])))
}

module.exports = {
  mean,
  meanArr
}
