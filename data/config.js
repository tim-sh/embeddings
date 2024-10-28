module.exports = {
  GITHUB_ISSUE: {
    relevantLabels: /your regex/,
    include: {
      labels: false,
      comments: false
    }
  },
  stacks: {
    maxLen: 10
  },
  tfIdf: {
    threshold: 0.1
  }
}
