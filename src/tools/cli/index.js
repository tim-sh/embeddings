#!/usr/bin/env -S node --experimental-sqlite --experimental-vm-modules

const { resolve } = require('node:path')
const assert = require('node:assert')

const pipelines = require('../../pipeline')
const { EmbeddingsManager } = require('../../docs/embeddings-manager')
const { fromHere } = require('../../util/fs')

async function main() {

  const [, , docsJsonPath, nSimilarStr , queryDocIdStr, ...baseDocIds] = process.argv
  assert(docsJsonPath, 'Missing docsJsonPath')
  assert(nSimilarStr, 'Missing nSimilarStr')
  assert(queryDocIdStr, 'Missing queryDocIdStr')

  const queryDocId = parseInt(queryDocIdStr)

  let docs = require(resolve(docsJsonPath))
  if (baseDocIds.length) {
    docs = docs.filter(doc => doc.number === queryDocId || baseDocIds.includes(doc.number.toString()))
  }

  const { Library } = require('../../docs/library')
  const library = new Library()
  await library.init(docs, pipelines.default.GITHUB_ISSUE, new EmbeddingsManager(fromHere('../../../data/temp/cli.db')))

  const mostSimilarDocs = library.getMostSimilarDocs(queryDocId, parseInt(nSimilarStr))
      .map(sim => {
        const { kind } = docs.find(doc => doc.number === sim.id)
        return { ...sim, kind }
      })
  console.dir(mostSimilarDocs, { depth: null })

  library.close()
}

(async () => {
  await main()
      .catch(err => console.error(err))
})()
