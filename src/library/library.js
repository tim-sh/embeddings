const assert = require('node:assert')
const TfIdf = require('natural').TfIdf

const { tfIdf: { threshold } } = require('../../data/config')

const { issueTransformLabels } = require('../pipeline/issue-transform-labels')
const { issueAddCommentTexts } = require('../pipeline/issue-add-comment-texts')
const { issueToText } = require('../pipeline/issue-to-text')
const { textRemoveCodeDelimiters } = require('../pipeline/text-remove-code-delimiters')
const { textTransformStacksAndWhitespace } = require('../pipeline/text-transform-stacks-and-whitespace')
const { textTransformPaths } = require('../pipeline/text-transform-paths')
const { textToTokens } = require('../pipeline/text-to-tokens')
const { runPipeline } = require('../pipeline/run-pipeline')
const { tokensRemoveStopwords } = require('../pipeline/tokens-remove-stopwords')
const { tokensToNgrams } = require('../pipeline/tokens-to-ngrams')
const { textTransformLowercase } = require('../pipeline/text-transform-lowercase')
const { embeddings } = require('../util/openai')
const { meanArr } = require('../util/maths')

class Library {
  constructor(corpus) {
    assert(Array.isArray(corpus), 'corpus must be an array')

    this.ngramsPipelines = {
      [docTypes.GITHUB_ISSUE]: [
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
      ]
    }

    this.corpus = corpus
    this.tfIdf = new TfIdf()

  }

  async init() {
    this.docs = await Promise.all(
        this.corpus
            .map(async doc => ({
              type: Library.getDocType(doc),
              id: Library.getId(doc),
              ngrams: (await runPipeline(this.ngramsPipelines[Library.getDocType(doc)], doc))
                  .filter(Boolean)
                  .flat()
            }))
    )

    this.docs.forEach((doc, i) => {
      doc.i = i
      this.tfIdf.addDocument(doc.ngrams)
    })

    this.tfIdfs = new Map()
    this.docs.forEach(doc =>
        doc.ngrams.forEach(ngram => this.tfIdfs.set(ngram, this.tfIdf.tfidf([ngram], doc.i)))
    )

    const tfIdfMin = Math.min(...this.tfIdfs.values())
    const tfIdfMax = Math.max(...this.tfIdfs.values())
    // Normalize to [0,1]
    this.tfIdfs.forEach((tfIdf, ngram) => this.tfIdfs.set(ngram, (tfIdf - tfIdfMin) / (tfIdfMax - tfIdfMin)))

    for (const doc of this.docs) {
      doc.tfIdfs = doc.ngrams.map(ngram => this.tfIdfs.get(ngram))
      const relevantNgrams = doc.ngrams.filter((ngram, i) => doc.tfIdfs[i] >= threshold)
      const ngEmbeddings = (await embeddings(relevantNgrams)).embeddings
      doc.embedding = meanArr(ngEmbeddings)
    }
  }

  static getDocType(doc) {
    assert('number' in doc && doc.title && doc.labels, 'doc must be a GitHub issue')
    return docTypes.GITHUB_ISSUE
  }

  static getId(doc) {
    return doc.number
  }
}

const docTypes = {
  GITHUB_ISSUE: 1
}

module.exports = {
  Library,
  ...docTypes
}
