const { issueToText } = require('../../src/pipeline/issue-to-text')

describe('issue-to-text', () => {
  it('should concatenate issue text', async () => {
    const issue = {
      title: ' Issue title',
      body: 'Issue body ',
      comments: [
        'Comment 1 ',
        'Comment 2',
        ' Comment 3',
      ],
    }

    const text = issueToText(issue)

    expect(text).toEqual(`Issue title

Issue body

Comment 1
Comment 2
Comment 3
`)
  })

  it('should ignore nullish body', async () => {
    const issue = {
      title: ' Issue title',
      body: null,
      comments: [
        'Comment 1 ',
        'Comment 2',
        ' Comment 3',
      ],
    }

    const text = issueToText(issue)

    expect(text).toEqual(`Issue title

Comment 1
Comment 2
Comment 3
`)
  })

  it('should ignore empty comments', async () => {
    const issue = {
      title: ' Issue title',
      body: 'Issue body ',
      comments: [],
    }

    const text = issueToText(issue)

    expect(text).toEqual(`Issue title

Issue body
`)
  })
})
