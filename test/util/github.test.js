const { apiUrl } = require('../mox/moc-konfig')
const { getComments } = require('../../src/util/github')

describe('github', () => {

  beforeAll(async () => {
    const { default: fetchMock } = await import('fetch-mock')
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/11/comments`, [
          { body: 'zuza', user: { type: 'User', login: 'user1', foo: 'bar' }, author_association: 'MEMBER' },
          { body: 'lula', user: { type: 'User', login: 'user2', baz: 42 }, author_association: 'COLLABORATOR' },
        ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/12/comments`, [])
  })

  describe('getComments', () => {
    it('should return comments', async () => {
      const comments = await getComments({ number: 11 })
      expect(comments).toEqual([
        { body: 'zuza', user: { type: 'User' } },
        { body: 'lula', user: { type: 'User' } },
      ])
    })
    it('should return empty array if no comments', async () => {
      const comments = await getComments({ number: 12 })
      expect(comments).toEqual([])
    })
  })
})
