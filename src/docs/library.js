const { TfIdf } = require('natural')

const { runPipeline } = require('../pipeline/run-pipeline')
const { meanVec, dot, descending, normalize } = require('../util/maths')
const { types: { GITHUB_ISSUE }, getDocType, getId } = require('./docs')
const Decimal = require('decimal.js')

class Library {
  constructor() {
    this.tfidfCalculator = new TfIdf()
  }

  async init(corpus, pipeline, embeddingsManager) {
    this.pipeline = pipeline
    this.embeddingsManager = embeddingsManager
    this.docs = []
    await this.addDocs(...corpus)
  }

  async addDocs(...extDocs) {
    for (const extDoc of extDocs) {
      const doc = await this.#toDoc(extDoc, this.docs.length)
      this.docs.push(doc)
      this.tfidfCalculator.addDocument(doc.scoredNgrams.map(sn => sn.ngram))
    }
    await this.#updateDocs()
  }

  getMostSimilarDocs(qDocId, n = Number.MAX_SAFE_INTEGER, type = GITHUB_ISSUE.type) {
    const qDoc = this.docs.find(doc => doc.type === type && doc.id === qDocId)
    if (!qDoc) {
      throw new Error(`Query doc ${qDocId} not found`)
    }
    return this.docs
        .filter(doc => doc.type === type && doc.id !== qDocId)
        .map(doc => {
          return ({
            id: doc.id,
            cosSimilarity: dot(qDoc.embedding, doc.embedding).toNumber(),
            ngrams: {
              query: qDoc.scoredNgrams.map(sn => ({ ngram: sn.ngram, tfidf: sn.tfidf.toNumber() })),
              doc: doc.scoredNgrams.map(sn => ({ ngram: sn.ngram, tfidf: sn.tfidf.toNumber() }))
            }
          })
        })
        .sort(({ cosSimilarity: s1 }, { cosSimilarity: s2 }) => descending(s1, s2))
        .slice(0, n)
  }

  async #toDoc(extDoc, i) {
    return {
      type: getDocType(extDoc),
      id: getId(extDoc),
      i,
      scoredNgrams: await runPipeline(this.pipeline, extDoc)
    }
  }

  async #updateDocs() {
    this.#updateAllTfidfs((sn, doc) => new Decimal(this.tfidfCalculator.tfidf([sn.ngram], doc.i)))

    for (const doc of this.docs) {
      const embeddings = await this.embeddingsManager.getEmbeddings(doc.scoredNgrams.map(sn => sn.ngram))
      doc.embedding = this.embeddingsManager.aggregate(embeddings, { weights: doc.scoredNgrams.map(sn => sn.tfidf) })
    }
  }

  #updateAllTfidfs(getTfidf) {
    let tfidfMax = new Decimal(0)
    this.docs.forEach(doc =>
        doc.scoredNgrams.forEach(sn => {
          const tfidf = getTfidf(sn, doc)
          sn.tfidf = tfidf
          tfidfMax = Decimal.max(tfidf, tfidfMax)
        })
    )
    return tfidfMax
  }

  close() {
    this.embeddingsManager.close()
  }
}

module.exports = {
  Library
}
