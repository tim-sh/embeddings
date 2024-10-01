const { ngrams } = require('natural').NGrams

function tokensToNgrams(tokens) {
  return [
    undefined,  // n=0
    tokens      // n=1
  ].concat(
      [
        2,
        3
      ]
          .map(n => ngrams(tokens, n)
          .map(tuple => tuple.join(' ')))
  )
}

module.exports = {
  tokensToNgrams
}
