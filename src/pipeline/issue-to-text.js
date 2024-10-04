function issueToText(issue) {
  let text = issue.title.trim()
  if (issue.body) {
    text += '\n\n' + issue.body.trim()
  }
  if (issue.comments?.length) {
    text += '\n\n' + issue.comments.map(c => c.trim()).join('\n')
  }
  return text + '\n'
}

module.exports = {
  issueToText
}
