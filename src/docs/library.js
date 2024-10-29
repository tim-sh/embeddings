const { TfIdf } = require('natural')

const { tfidf: { threshold } } = require('../../data/config')
const { runPipeline } = require('../pipeline/run-pipeline')
const { embed } = require('../util/openai')
const { meanVec, dot, descending } = require('../util/maths')
const { types: { GITHUB_ISSUE }, getDocType, getId } = require('./docs')

class Library {
  constructor() {
    this.tfidfCalculator = new TfIdf()
  }

  async init(corpus, pipeline) {
    this.pipeline = pipeline
    this.docs = []
    await this.addDocs(...corpus)
  }

  async addDocs(...extDocs) {
    for (const extDoc of extDocs) {
      const doc = await this.#toDoc(extDoc, this.docs.length)
      this.docs.push(doc)
      this.tfidfCalculator.addDocument(doc.scoredNgrams.map(sn => sn.ngram))
    }
    await this.#docsUpdated()
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

  async #toDoc(extDoc, i) {
    return {
      type: getDocType(extDoc),
      id: getId(extDoc),
      i,
      scoredNgrams: await runPipeline(this.pipeline, extDoc)
    }
  }

  async #docsUpdated() {
    const tfidfMax = this.#updateAllTfidfs((sn, doc) => this.tfidfCalculator.tfidf([sn.ngram], doc.i))
    this.#updateAllTfidfs((sn, _) => sn.tfidf / tfidfMax)

    const embeddingsByNgrams = new Map()

    for (const doc of this.docs) {
      let thr = threshold
      do {
        doc.relevantNgrams = doc.scoredNgrams
            .filter(sn => sn.tfidf >= thr)
            .map(sn => sn.ngram)
      } while (doc.relevantNgrams.length === 0 && (thr -= 0.01) > 0)
      if (doc.relevantNgrams.length === 0) {
        throw new Error(`No relevant n-grams found for doc ${doc.id}`)
      }
      doc.ngramThreshold = thr
      doc.relevantNgrams.forEach(ngram => embeddingsByNgrams.set(ngram, null))
    }

    // Embed n-grams individually

    const chunkSize = 2048
    const ngrams = Array.from(embeddingsByNgrams.keys())
    for (let i = 0; i < embeddingsByNgrams.size; i += chunkSize) {
      const ngramsChunk = ngrams.slice(i, i + chunkSize)
      const { embeddings } = await embed(ngramsChunk)
          .catch(err => {
            const causingDocs = this.docs.filter(doc => doc.relevantNgrams.some(ngram => ngramsChunk.includes(ngram)))
            throw new Error(`Failed to embed ngrams for docs ${causingDocs.map(doc => doc.id).join(', ')}: ${err}`)
          })
      ngramsChunk.forEach((ngram, i) => embeddingsByNgrams.set(ngram, embeddings[i]))
    }

    // Embed concatenated n-grams

    for (const doc of this.docs) {
      doc.catEmbedding = (await embed(doc.relevantNgrams.join(' '))
          .catch(err => {
            throw new Error(`Failed to embed concatenated ngrams for doc ${doc.id}: ${err}`)
          })).embeddings[0]
      doc.embedding = meanVec(doc.relevantNgrams.map(ngram => embeddingsByNgrams.get(ngram)))
    }
  }

  #updateAllTfidfs(getTfidf) {
    let tfidfMax = 0
    this.docs.forEach(doc =>
        doc.scoredNgrams.forEach(sn => {
          const tfidf = getTfidf(sn, doc)
          sn.tfidf = tfidf
          tfidfMax = Math.max(tfidf, tfidfMax)
        })
    )
    return tfidfMax
  }
}

module.exports = {
  Library
}
