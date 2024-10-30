const { DatabaseSync } = require('node:sqlite')
const Decimal = require('decimal.js')

const { OneTableDbSync } = require('./index')

class EmbeddingsSqliteDb extends OneTableDbSync {
  constructor(dbPath, { drop = false } = {}) {
    super()
    this.db = new DatabaseSync(dbPath)
    if (drop) {
      this.db.exec(`DROP TABLE IF EXISTS embeddings`)
    }
    this.db.exec(`CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT UNIQUE,
        embedding TEXT
    )`)
  }

  close() {
    this.db.close()
  }

  insert({ text, embedding }) {
    this.db.prepare(`INSERT INTO embeddings (text, embedding) VALUES (?, ?)`)
        .run(text, JSON.stringify(embedding))
  }

  query({ text }) {
    const embedding = this.db.prepare(`SELECT (embedding) FROM embeddings WHERE text = ?`)
        .get(text)
        ?.embedding
    return embedding ? JSON.parse(embedding, (_, v) => typeof v === 'string' ? new Decimal(v) : v) : null
  }

  update(conditions, data) {
    throw new Error('update not implemented')
  }

  delete(conditions) {
    throw new Error('delete not implemented')
  }
}

module.exports = { EmbeddingsSqliteDb }
