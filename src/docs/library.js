const TfIdf = require('natural').TfIdf

const { tfIdf: { threshold } } = require('../../data/config')
const { runPipeline } = require('../pipeline/run-pipeline')
const { embed } = require('../util/openai')
const { meanVec, dot, descending } = require('../util/maths')
const { types: { GITHUB_ISSUE }, getDocType, getId } = require('./docs')

class Library {
  constructor() {
    this.termFreqCalculator = new TfIdf()
  }

  async init(corpus, pipeline) {
    this.pipeline = pipeline
    this.docs = await Promise.all(
        corpus
            .map((extDoc, i) => this.#toDoc(extDoc, i))
            .filter(Boolean)
    )
    this.docs.forEach(doc => this.termFreqCalculator.addDocument(doc.ngrams))
    await this.#docsUpdated()
  }

  async addDoc(extDoc) {
    const doc = await this.#toDoc(extDoc, this.docs.length)
    this.docs.push(doc)
    this.termFreqCalculator.addDocument(doc.ngrams)
    await this.#docsUpdated()
  }

  getMostSimilarDocs(qDocId, n = 1, type = GITHUB_ISSUE.type) {
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
      ngrams: (await runPipeline(this.pipeline, extDoc))
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

    // Normalize TF-IDF scores

    tfIdfs.forEach((tfIdf, ngram) => tfIdfs.set(ngram, (tfIdf - tfIdfMin) / (tfIdfMax - tfIdfMin)))

    const embeddingsByNgrams = new Map()

    for (const doc of this.docs) {
      doc.tfIdfs = doc.ngrams.map(ngram => tfIdfs.get(ngram))
      let thr = threshold
      do {
        doc.relevantNgrams = doc.ngrams.filter((ngram, i) => doc.tfIdfs[i] >= thr)
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
}

module.exports = {
  Library
}
