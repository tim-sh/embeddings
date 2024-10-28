const assert = require('node:assert')


const types = {
  GITHUB_ISSUE: {
    type: 1
  }
}

function getDocType(doc) {
  assert('number' in doc && doc.title && doc.labels, 'doc must be a GitHub issue')
  return types.GITHUB_ISSUE.type
}

function getId(doc) {
  return doc.number
}

module.exports = {
  types,
  getDocType,
  getId
}
