const { EmbeddingsSqliteDb } = require('../db/embeddings-sqlite')
const { embed } = require('../util/openai')

class EmbeddingsManager {
  constructor(dbPath) {
    this.db = new EmbeddingsSqliteDb(dbPath)
  }

  async getEmbeddings(ngrams) {
    const embeddingsByNgrams = new Map()
    ngrams.forEach(ngram => embeddingsByNgrams.set(ngram, null))

    const missing = []

    embeddingsByNgrams.forEach((_, ngram) => {
      const embedding = this.db.query({ text: ngram })
      if (embedding) {
        embeddingsByNgrams.set(ngram, embedding)
      } else {
        missing.push(ngram)
      }
    })

    if (missing.length) {
      const computed = (await embed(missing)).embeddings

      missing.forEach((ngram, i) => {
        const embedding = computed[i]
        embeddingsByNgrams.set(ngram, embedding)
        this.db.insert({ text: ngram, embedding })
      })
    }

    return ngrams.map(ngram => embeddingsByNgrams.get(ngram))
  }

  close() {
    this.db.close()
  }

}

module.exports = { EmbeddingsManager }
