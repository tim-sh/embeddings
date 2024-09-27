const { getComments } = require('../util/github')

async function addNonBotCommentTexts(issue) {
  issue.comments = (await getComments(issue, ['user', 'body']))
      .filter(({ user }) => user?.type !== 'Bot')
      .map(({ body }) => body)
      .filter(Boolean)
}

module.exports = {
  addNonBotCommentTexts
}
