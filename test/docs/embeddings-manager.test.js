const { fromHere } = require('../../src/util/fs')
const Decimal = require('decimal.js')

const dbPath = fromHere('test.db')

function dec(v) {
  return new Decimal(v)
}

function createDb() {
  const { EmbeddingsSqliteDb } = require('../../src/db/embeddings-sqlite')
  const db = new EmbeddingsSqliteDb(dbPath, { drop: true })
  db.insert({ text: 'ngram1', embedding: [dec(42), dec(43), dec(44)] })
  db.close()
}

describe('embeddings-manager', () => {

  beforeAll(async () => {
    const mockDec = dec
    jest.mock('../../src/util/openai', () => ({
      embed: jest.fn(async (ngrams) => ({ embeddings: ngrams.map((_, i) => [mockDec(i), mockDec(i + 1), mockDec(i + 2)]) }))
    }))
    createDb()
  })

  it('should query or compute embeddings', async () => {
    const { EmbeddingsManager } = require('../../src/docs/embeddings-manager')
    const { embed } = require('../../src/util/openai')
    const embeddingsManager = new EmbeddingsManager(dbPath)

    const ngrams = ['ngram1', 'ngram2', 'ngram3']

    const result1 = await embeddingsManager.getEmbeddings(ngrams)
    expect(result1).toEqual([
      [dec(42), dec(43), dec(44)],
      [dec(0), dec(1), dec(2)],
      [dec(1), dec(2), dec(3)]
    ])
    expect(embed).toHaveBeenCalledWith(['ngram2', 'ngram3'])
    embed.mockClear()

    const result2 = embeddingsManager.getEmbeddings(ngrams)
    expect(await result2).toEqual(result1)
    expect(embed).not.toHaveBeenCalled()
  })

})
