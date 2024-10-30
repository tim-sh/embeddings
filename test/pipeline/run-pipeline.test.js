const { apiUrl } = require('../mox/moc-konfig')

const { runPipeline } = require('../../src/pipeline/run-pipeline')
const { issueTransformLabels } = require('../../src/pipeline/issue-transform-labels')
const { issueToText } = require('../../src/pipeline/issue-to-text')
const { textRemoveCodeDelimiters } = require('../../src/pipeline/text-remove-code-delimiters')
const { textTransformStacksAndWhitespace } = require('../../src/pipeline/text-transform-stacks-and-whitespace')
const { textTransformPaths } = require('../../src/pipeline/text-transform-paths')
const { textToTokens } = require('../../src/pipeline/text-to-tokens')
const { tokensRemoveStopwords } = require('../../src/pipeline/tokens-remove-stopwords')
const { tokensToNgrams } = require('../../src/pipeline/tokens-to-ngrams')
const { textTransformLowercase } = require('../../src/pipeline/text-transform-lowercase')

describe('run-pipeline', () => {

  it('transforms issue to n-grams', async () => {
    expect(await runPipeline([
      issueTransformLabels,
      issueToText,
      textRemoveCodeDelimiters,
      textTransformStacksAndWhitespace,
      textTransformPaths,
      textTransformLowercase,
      textToTokens,
      tokensRemoveStopwords,
      tokensToNgrams
    ], {
      number: 123,
      title: 'Something went wrong',
      labels: ['bug'],
      body: 'I have this very serious problem. Please help.'
    })).toEqual([
      { n: 1, ngram: 'something' },
      { n: 1, ngram: 'went' },
      { n: 1, ngram: 'wrong' },
      { n: 1, ngram: 'serious' },
      { n: 1, ngram: 'problem' },
      { n: 1, ngram: 'please' },
      { n: 1, ngram: 'help' },
      { n: 2, ngram: 'something went' },
      { n: 2, ngram: 'went wrong' },
      { n: 2, ngram: 'wrong serious' },
      { n: 2, ngram: 'serious problem' },
      { n: 2, ngram: 'problem please' },
      { n: 2, ngram: 'please help' },
      { n: 3, ngram: 'something went wrong' },
      { n: 3, ngram: 'went wrong serious' },
      { n: 3, ngram: 'wrong serious problem' },
      { n: 3, ngram: 'serious problem please' },
      { n: 3, ngram: 'problem please help' }
    ])
  })
})
