const { tokensToNgrams } = require('../../src/pipeline/tokens-to-ngrams')

describe('tokens-to-ngrams', () => {
  it('produces 1- to 3-grams', async () => {
    expect(tokensToNgrams([
      'There',
      'big',
      'problem',
      'machine',
      'not',
      'working',
      'what',
      'do'
    ])).toEqual([
      { n: 1, ngram: 'There' },
      { n: 1, ngram: 'big' },
      { n: 1, ngram: 'problem' },
      { n: 1, ngram: 'machine' },
      { n: 1, ngram: 'not' },
      { n: 1, ngram: 'working' },
      { n: 1, ngram: 'what' },
      { n: 1, ngram: 'do' },
      { n: 2, ngram: 'There big' },
      { n: 2, ngram: 'big problem' },
      { n: 2, ngram: 'problem machine' },
      { n: 2, ngram: 'machine not' },
      { n: 2, ngram: 'not working' },
      { n: 2, ngram: 'working what' },
      { n: 2, ngram: 'what do' },
      { n: 3, ngram: 'There big problem' },
      { n: 3, ngram: 'big problem machine' },
      { n: 3, ngram: 'problem machine not' },
      { n: 3, ngram: 'machine not working' },
      { n: 3, ngram: 'not working what' },
      { n: 3, ngram: 'working what do' }
    ])
  })
})
