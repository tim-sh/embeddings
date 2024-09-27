const { proj } = require('../util/fs')
const { issues: { relevantLabels } } = require(proj('data/config'))

function transform(issue) {
  issue.labels = issue.labels
          .map(label => relevantLabels.exec(typeof label === 'string' ? label : label.name)
              ?.slice(1)
              .filter(Boolean)
              .join(' ')
          )
          .filter(Boolean)
      ?? []
}

module.exports = transform
