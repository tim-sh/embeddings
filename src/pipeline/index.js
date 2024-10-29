const { GITHUB_ISSUE } = require('../../data/config')

const { issueTransformLabels } = require('../pipeline/issue-transform-labels')
const { issueAddCommentTexts } = require('../pipeline/issue-add-comment-texts')
const { issueToText } = require('../pipeline/issue-to-text')
const { textRemoveCodeDelimiters } = require('../pipeline/text-remove-code-delimiters')
const { textTransformStacksAndWhitespace } = require('../pipeline/text-transform-stacks-and-whitespace')
const { textTransformPaths } = require('../pipeline/text-transform-paths')
const { textTransformLowercase } = require('../pipeline/text-transform-lowercase')
const { textToTokens } = require('../pipeline/text-to-tokens')
const { tokensRemoveStopwords } = require('../pipeline/tokens-remove-stopwords')
const { tokensToNgrams } = require('../pipeline/tokens-to-ngrams')

module.exports = {
  default: {
    GITHUB_ISSUE: [
      GITHUB_ISSUE.include.labels && issueTransformLabels,
      GITHUB_ISSUE.include.comments && issueAddCommentTexts,
      issueToText,
      textRemoveCodeDelimiters,
      textTransformStacksAndWhitespace,
      textTransformPaths,
      textTransformLowercase,
      textToTokens,
      tokensRemoveStopwords,
      tokensToNgrams
    ].filter(Boolean)
  },
  functions: {
    issueTransformLabels,
    issueAddCommentTexts,
    issueToText,
    textRemoveCodeDelimiters,
    textTransformStacksAndWhitespace,
    textTransformPaths,
    textTransformLowercase,
    textToTokens,
    tokensRemoveStopwords,
    tokensToNgrams
  }
}
