function issueToText(issue) {
  let text = issue.title.trim()
  if (issue.body) {
    text += ' ' + issue.body.trim()
  }
  if (issue.comments.length) {
    text += ' ' + issue.comments.map(c => c.trim()).join(' ')
  }
  return text
}

module.exports = {
  issueToText
}
