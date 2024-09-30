const { getComments } = require('../util/github')

async function issueAddCommentTexts(issue) {
  issue.comments = (await getComments(issue, ['user', 'body']))
      .filter(({ user }) => user?.type !== 'Bot')
      .map(({ body }) => body)
      .filter(Boolean)
  return issue
}

module.exports = {
  issueAddCommentTexts
}
