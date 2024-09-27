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
  }
}))

module.exports = {
  apiUrl
}
