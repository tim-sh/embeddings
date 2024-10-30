const tokenUrl = 'https://token.sjfirwKJHRhjhj.com'
const deploymentUrl = 'https://dep.sjfirwKJHRhjhj.com'
const outputLength = 10

jest.mock('../../data/.private/config', () => ({
  github: {
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
  GITHUB_ISSUE: {
    relevantLabels: /me(owl)! (.*)/,
    include: {
      labels: false
    },
    stacks: {
      maxLen: 3
    }
  },
  tfidf: {
    threshold: 0.1
  }
}))

function unmock() {
  jest.unmock('../../data/.private/config')
  jest.unmock('../../data/config')
}

module.exports = {
  tokenUrl,
  deploymentUrl,
  outputLength,
  unmock
}
