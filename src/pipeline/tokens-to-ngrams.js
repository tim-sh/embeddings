const { ngrams: getNgrams } = require('natural').NGrams

function tokensToNgrams(tokens) {
  const ngramsWithDuplicates = [
    tokens      // n=1
  ].concat(
      [
        2,
        3
      ].map(n => getNgrams(tokens, n).map(tuple => tuple.join(' ')))
  )
  return Array.from(new Set(ngramsWithDuplicates))
      .flatMap((ngrams, i) => ngrams.map(ngram => ({
        ngram,
        n: i + 1
      })))
}

module.exports = {
  tokensToNgrams
}
