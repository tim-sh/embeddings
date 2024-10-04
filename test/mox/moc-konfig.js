const apiUrl = 'https://api.juhpuewqahtjLAKUZTE.com'
const tokenUrl = 'https://token.sjfirwKJHRhjhj.com'
const deploymentUrl = 'https://dep.sjfirwKJHRhjhj.com'
const outputLength = 10

jest.mock('../../data/.private/config.json', () => ({
  github: {
    apiUrl,
    token: 'token',
    org: 'org',
    repo: 'repo'
  },
  models: {
    EMBED_ADA_002: {
      deploymentUrl,
      outputLength,
      costPerToken: 1e-8,
      credentialsKey: 'embeddings'
    }
  },
  credentials: {
    embeddings: {
      url: tokenUrl,
      clientid: 'clientid',
      clientsecret: 'clientsecret'
    }
  }
}))

jest.mock('../../data/config', () => ({
  issues: {
    relevantLabels: /me(owl)! (.*)/,
    include: {
      labels: false,
      comments: false
    }
  },
  stacks: {
    maxLen: 3
  },
  tfIdf: {
    threshold: 0.1
  }
}))

module.exports = {
  apiUrl,
  tokenUrl,
  deploymentUrl,
  outputLength
}
