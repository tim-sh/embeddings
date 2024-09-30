const { ngrams } = require('natural').NGrams

function tokensToNgrams(tokens) {
  return tokens.concat(
      [2, 3, 4]
          .map(n => ngrams(tokens, n))
          .flat()
  )
}

module.exports = {
  tokensToNgrams
}
