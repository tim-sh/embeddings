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
const { embed } = require('../util/openai')
const { meanVec, dot, descending } = require('../util/maths')

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

  getMostSimilarDocs(qDocId, n = 1, type = Library.docTypes.GITHUB_ISSUE) {
    const qDoc = this.docs.find(doc => doc.type === type && doc.id === qDocId)
    if (!qDoc) {
      throw new Error(`Query doc ${qDocId} not found`)
    }
    return this.docs
        .filter(doc => doc.type === type && doc.id !== qDocId)
        .map(doc => {
          return ({
            id: doc.id,
            cosSimilarity: dot(qDoc.catEmbedding, doc.catEmbedding).toNumber(),
            cosSimilarityMean: dot(qDoc.embedding, doc.embedding).toNumber(),
            relevantNgrams: {
              query: qDoc.relevantNgrams,
              doc: doc.relevantNgrams
            },
            ngramThresholds: {
              query: qDoc.ngramThreshold,
              doc: doc.ngramThreshold
            }
          })
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

    const embeddingsByNgrams = new Map()

    for (const doc of this.docs) {
      doc.tfIdfs = doc.ngrams.map(ngram => tfIdfs.get(ngram))
      doc.relevantNgrams = doc.ngrams.filter((ngram, i) => doc.tfIdfs[i] >= threshold)
      doc.relevantNgrams.forEach(ngram => embeddingsByNgrams.set(ngram, null))
    }

    const chunkSize = 2048
    const embeddingsByNgramsArray = Array.from(embeddingsByNgrams.keys())
    for (let i = 0; i < embeddingsByNgrams.size; i += chunkSize) {
      const chunk = embeddingsByNgramsArray.slice(i, i + chunkSize)
      const { embeddings } = await embed(chunk)
      chunk.forEach((ngram, i) => embeddingsByNgrams.set(ngram, embeddings[i]))
    }

    for (const doc of this.docs) {
      doc.catEmbedding = (await embed(doc.relevantNgrams.join(' '))).embeddings[0]
      doc.embedding = meanVec(doc.relevantNgrams.map(ngram => embeddingsByNgrams.get(ngram)))
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
