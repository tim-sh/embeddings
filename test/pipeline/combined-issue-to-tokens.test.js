const { apiUrl } = require('../mox/moc-konfig')

const { textRemoveCodeDelimiters } = require('../../src/pipeline/text-remove-code-delimiters')
const { textTransformPaths } = require('../../src/pipeline/text-transform-paths')
const { textTransformStacksAndWhitespace } = require('../../src/pipeline/text-transform-stacks-and-whitespace')
const { issueToText } = require('../../src/pipeline/issue-to-text')
const { issueAddCommentTexts } = require('../../src/pipeline/issue-add-comment-texts')
const { issueTransformLabels } = require('../../src/pipeline/issue-transform-labels')
const { textToTokens } = require('../../src/pipeline/text-to-tokens')
const { textTransformLowercase } = require('../../src/pipeline/text-transform-lowercase')

describe('combined-issue-to-tokens', () => {

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

  it('should transform issue to tokens', async () => {
    const issue = {
      number: 123,
      title: 'Something went wrong',
      labels: ['bug'],
      body: `Oh well, you know, something went wrong. I just don't know what. Can u help?`
    }

    const tokens =
        textToTokens(
            textTransformLowercase(
                textTransformPaths(
                    textTransformStacksAndWhitespace(
                        textRemoveCodeDelimiters(
                            issueToText(
                                await issueAddCommentTexts(
                                    issueTransformLabels(issue)
                                )
                            )
                        )
                    )
                )
            )
        )

    expect(tokens).toEqual([
      'something',
      'went',
      'wrong',
      'oh',
      'well',
      'you',
      'know',
      'something',
      'went',
      'wrong',
      'i',
      'just',
      'don',
      't',
      'know',
      'what',
      'can',
      'u',
      'help',
      'comment',
      '1',
      'comment',
      '2',
      'comment',
      '3'
    ])

  })
})
