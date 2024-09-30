const natural = require('natural')

function textToTokens(text) {
  const tokenizer = new natural.WordTokenizer()
  return tokenizer.tokenize(text)
}

module.exports = {
  textToTokens
}
