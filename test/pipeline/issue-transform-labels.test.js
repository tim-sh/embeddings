require('../mox/moc-konfig')
const { issueTransformLabels } = require('../../src/pipeline/issue-transform-labels')

describe('issue-transform-labels', () => {
  it('should transform labels into strings removing irrelevant entries', async () => {
    const issue = {
      labels: [
        { name: 'mewow! foo' },
        { name: 'mewow! bar' },
        { name: 'what else' },
        { name: 'cap lorem' },
        { name: 'mewow! cds42' },
      ],
      some: 'more',
      pro: 'perties'
    }
    const originalIssue = { ...issue }

    issueTransformLabels(issue)

    expect(issue.labels).toEqual(['wow foo', 'wow bar', 'wow cds42'])

    delete issue.labels
    delete originalIssue.labels
    expect(issue).toEqual(originalIssue)
  })

  it('should remove irrelevant entries', async () => {
    const issue = {
      labels: [
          'mewow! foo',
          'mewow! bar',
          'what else',
          'cap lorem',
          'mewow! cds42'
      ],
      more: 'properties'
    }
    const originalIssue = { ...issue }

    issueTransformLabels(issue)

    expect(issue.labels).toEqual(['wow foo', 'wow bar', 'wow cds42'])

    delete issue.labels
    delete originalIssue.labels
    expect(issue).toEqual(originalIssue)
  })
})
