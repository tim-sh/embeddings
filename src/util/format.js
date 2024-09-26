function rndStr(number) {
  return Math.random().toString(36).substring(2, number + 2)
}

module.exports = {
  rndStr
}
