const { apiUrl } = require('../mox/moc-konfig')

const { runPipeline } = require('../../src/pipeline/run-pipeline')
const { issueTransformLabels } = require('../../src/pipeline/issue-transform-labels')
const { issueAddCommentTexts } = require('../../src/pipeline/issue-add-comment-texts')
const { issueToText } = require('../../src/pipeline/issue-to-text')
const { textRemoveCodeDelimiters } = require('../../src/pipeline/text-remove-code-delimiters')
const { textTransformStacksAndWhitespace } = require('../../src/pipeline/text-transform-stacks-and-whitespace')
const { textTransformPaths } = require('../../src/pipeline/text-transform-paths')
const { textToTokens } = require('../../src/pipeline/text-to-tokens')
const { tokensRemoveStopwords } = require('../../src/pipeline/tokens-remove-stopwords')
const { tokensToNgrams } = require('../../src/pipeline/tokens-to-ngrams')
const { textTransformLowercase } = require('../../src/pipeline/text-transform-lowercase')

describe('run-pipeline', () => {

  beforeAll(async () => {
    const { default: fetchMock } = await import('fetch-mock')
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/123/comments`, [
      { body: 'comment 1', user: { type: 'User', login: 'user1' }, author_association: 'MEMBER' },
      { body: `I'm a tea bot`, user: { type: 'Bot' } },
      { body: 'comment 2', user: { type: 'User' }, created_at: '2001-01-01T01:00:00Z' },
      { body: 'comment 3', user: null },
      { body: undefined, user: { type: 'User' } },
    ])
  })

  it('transforms issue to n-grams', async () => {
    expect(await runPipeline([
      issueTransformLabels,
      issueAddCommentTexts,
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
      undefined,
      [
        "something",
        "went",
        "wrong",
        "serious",
        "problem",
        "please",
        "help",
        "comment",
        "1",
        "comment",
        "2",
        "comment",
        "3"
      ],
      [
        "something went",
        "went wrong",
        "wrong serious",
        "serious problem",
        "problem please",
        "please help",
        "help comment",
        "comment 1",
        "1 comment",
        "comment 2",
        "2 comment",
        "comment 3"
      ],
      [
        "something went wrong",
        "went wrong serious",
        "wrong serious problem",
        "serious problem please",
        "problem please help",
        "please help comment",
        "help comment 1",
        "comment 1 comment",
        "1 comment 2",
        "comment 2 comment",
        "2 comment 3"
      ]
    ])
  })
})
