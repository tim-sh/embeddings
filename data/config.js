module.exports = {
  GITHUB_ISSUE: {
    relevantLabels: /your regex/,
    include: {
      labels: false
    },
    stacks: {
      maxLen: 10
    }
  },
  tfidf: {
    threshold: 0.1
  }
}
