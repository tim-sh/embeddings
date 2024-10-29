const { GITHUB_ISSUE: { relevantLabels } } = require('../../data/config')

function issueTransformLabels(issue) {
  issue.labels = issue.labels
          .map(label => relevantLabels.exec(typeof label === 'string' ? label : label.name)
              ?.slice(1)
              .filter(Boolean)
              .join(' ')
          )
          .filter(Boolean)
      ?? []
  return issue
}

module.exports = {
  issueTransformLabels
}
