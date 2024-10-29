const { ngrams } = require('natural').NGrams

function tokensToNgrams(tokens) {
  return [
    tokens      // n=1
  ].concat(
      [
        2,
        3
      ].map(n =>
          ngrams(tokens, n).map(tuple => tuple.join(' '))
      )
  ).flatMap((ngrams, i) => ngrams.map(ngram => ({
    ngram,
    n: i + 1
  })))
}

module.exports = {
  tokensToNgrams
}
