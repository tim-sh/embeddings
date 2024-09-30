const apiUrl = 'https://glkjuhpuewqahtjLAKUZTE.com'

jest.mock('../../data/.private/config.json', () => ({
  github: {
    apiUrl,
    token: 'token',
    org: 'org',
    repo: 'repo'
  }
}))

jest.mock('../../data/config', () => ({
  issues: {
    relevantLabels: /me(wow)! (.*)/
  },
  stacks: {
    maxLen: 3
  }
}))

module.exports = {
  apiUrl
}
