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
  constructor() {
    this.termFreqCalculator = new TfIdf()
  }

  async init(corpus) {
    this.docs = await Promise.all(corpus.map((extDoc, i) => this.#toDoc(extDoc, i)))
    this.docs.forEach(doc => this.termFreqCalculator.addDocument(doc.ngrams))
    await this.#docsUpdated()
  }

  async addDoc(extDoc) {
    const doc = await this.#toDoc(extDoc, this.docs.length)
    this.docs.push(doc)
    this.termFreqCalculator.addDocument(doc.ngrams)
    await this.#docsUpdated()
  }

  async #toDoc(extDoc, i) {
    return {
      type: Library.getDocType(extDoc),
      id: Library.getId(extDoc),
      i,
      ngrams: (await runPipeline(Library.ngramsPipelines[Library.getDocType(extDoc)], extDoc))
          .filter(Boolean)
          .flat()
    }
  }

  async #docsUpdated() {
    const tfIdfs = new Map()
    this.docs.forEach(doc =>
        doc.ngrams.forEach(ngram => tfIdfs.set(ngram, this.termFreqCalculator.tfidf([ngram], doc.i)))
    )

    const tfIdfMin = Math.min(...tfIdfs.values())
    const tfIdfMax = Math.max(...tfIdfs.values())
    // Normalize to [0,1]
    tfIdfs.forEach((tfIdf, ngram) => tfIdfs.set(ngram, (tfIdf - tfIdfMin) / (tfIdfMax - tfIdfMin)))

    for (const doc of this.docs) {
      doc.tfIdfs = doc.ngrams.map(ngram => tfIdfs.get(ngram))
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

  static get ngramsPipelines() {
    return {
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
  }
}

const docTypes = {
  GITHUB_ISSUE: 1
}

module.exports = {
  Library,
  ...docTypes
}
