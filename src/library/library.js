const assert = require('node:assert')
const TfIdf = require('natural').TfIdf

const { issues: { include }, tfIdf: { threshold } } = require('../../data/config')

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
const { meanArr, dot, descending } = require('../util/maths')

class Library {
  constructor() {
    this.termFreqCalculator = new TfIdf()
  }

  async init(corpus) {
    this.docs = await Promise.all(
        corpus
            .slice(0, include.latest)
            .map((extDoc, i, { length }) => Library.#toDoc(extDoc, i))
            .filter(Boolean)
    )
    this.docs.forEach(doc => this.termFreqCalculator.addDocument(doc.ngrams))
    await this.#docsUpdated()
  }

  async addDoc(extDoc) {
    const doc = await Library.#toDoc(extDoc, this.docs.length)
    this.docs.push(doc)
    this.termFreqCalculator.addDocument(doc.ngrams)
    await this.#docsUpdated()
  }

  getMostSimilarDocs(docId, n = 1, type = Library.docTypes.GITHUB_ISSUE) {
    const givenDoc = this.docs.find(doc => doc.type === type && doc.id === docId)
    if (!givenDoc) {
      return null
    }
    return this.docs
        .filter(otherDoc => otherDoc.type === type && otherDoc.id !== docId)
        .map(doc => {
          return {
            id: doc.id,
            cosSimilarity: dot(givenDoc.embedding, doc.embedding)
          }
        })
        .sort(({ cosSimilarity: s1 }, { cosSimilarity: s2 }) => descending(s1, s2))
        .slice(0, n)
  }

  static async #toDoc(extDoc, i) {
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
    return this.docTypes.GITHUB_ISSUE
  }

  static getId(doc) {
    return doc.number
  }

  static get ngramsPipelines() {
    return {
      [this.docTypes.GITHUB_ISSUE]: [
        include.labels && issueTransformLabels,
        include.comments && issueAddCommentTexts,
        issueToText,
        textRemoveCodeDelimiters,
        textTransformStacksAndWhitespace,
        textTransformPaths,
        textTransformLowercase,
        textToTokens,
        tokensRemoveStopwords,
        tokensToNgrams
      ]
          .filter(Boolean)
    }
  }

  static get docTypes() {
    return {
      GITHUB_ISSUE: 1
    }
  }
}

module.exports = {
  Library
}
