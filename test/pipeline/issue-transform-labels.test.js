require('../mox/moc-konfig')
const { issueTransformLabels } = require('../../src/pipeline/issue-transform-labels')

describe('issue-transform-labels', () => {
  it('should transform labels into strings removing irrelevant entries', async () => {
    const issue = {
      labels: [
        { name: 'meowl! foo' },
        { name: 'meowl! bar' },
        { name: 'what else' },
        { name: 'cap lorem' },
        { name: 'meowl! cds42' },
      ],
      some: 'more',
      pro: 'perties'
    }
    const originalIssue = { ...issue }

    issueTransformLabels(issue)

    expect(issue.labels).toEqual(['owl foo', 'owl bar', 'owl cds42'])

    delete issue.labels
    delete originalIssue.labels
    expect(issue).toEqual(originalIssue)
  })

  it('should remove irrelevant entries', async () => {
    const issue = {
      labels: [
          'meowl! foo',
          'meowl! bar',
          'what else',
          'cap lorem',
          'meowl! cds42'
      ],
      more: 'properties'
    }
    const originalIssue = { ...issue }

    issueTransformLabels(issue)

    expect(issue.labels).toEqual(['owl foo', 'owl bar', 'owl cds42'])

    delete issue.labels
    delete originalIssue.labels
    expect(issue).toEqual(originalIssue)
  })
})
