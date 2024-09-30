const { tokensToNgrams } = require('src/pipeline/tokens-to-ngrams')
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
      'There',
      'big',
      'problem',
      'machine',
      'not',
      'working',
      'what',
      'do',
      'There big',
      'big problem',
      'problem machine',
      'machine not',
      'not working',
      'working what',
      'what do',
      'There big problem',
      'big problem machine',
      'problem machine not',
      'machine not working',
      'not working what',
      'working what do'
    ])
  })
})
