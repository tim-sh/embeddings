const { tokensRemoveStopwords } = require('../../src/pipeline/tokens-remove-stopwords')

describe('tokens-remove-stopwords', () => {
  it('should remove common stopwords', async () => {
    expect(tokensRemoveStopwords([
      'Something',
      'went',
      'wrong',
      'Hallo',
      'Hello',
      'hi',
      'hey',
      'mein',
      'Name',
      'ist',
      'Peter',
      'well',
      'you',
      'know',
      'I',
      'just',
      'don',
      't',
      'know',
      'thanks',
      'thank',
      'you',
      'danke',
      'cheers'
    ])).toEqual([
      'Something',
      'went',
      'wrong',
      'Name',
      'Peter',
      'know',
      'just',
      'don',
      'know'
    ])
  })
})
