const { apiUrl } = require('../mox/moc-konfig')
const { addNonBotCommentTexts } = require('../../src/pipeline/add-non-bot-comment-texts')

describe('add-non-bot-comment-texts', () => {

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

  it('should add non-bot comment texts to issue', async () => {
    const issue = {
      number: 123,
      foo: 'bar'
    }
    const originalIssue = { ...issue }

    await addNonBotCommentTexts(issue)

    expect(issue.comments).toEqual([
      'comment 1',
      'comment 2',
      'comment 3'
    ])

    delete issue.comments
    expect(issue).toEqual(originalIssue)
  })
})
