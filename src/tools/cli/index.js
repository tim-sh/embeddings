#!/usr/bin/env node

async function main() {
  const { resolve } = require('node:path')
  const assert = require('node:assert')

  const [, , docsJsonPath, nSimilarStr , queryDocIdStr, ...baseDocIds] = process.argv
  assert(docsJsonPath, 'Missing docsJsonPath')
  assert(nSimilarStr, 'Missing nSimilarStr')
  assert(queryDocIdStr, 'Missing queryDocIdStr')

  const queryDocId = parseInt(queryDocIdStr)

  let docs = require(resolve(docsJsonPath))
  if (baseDocIds.length) {
    docs = docs.filter(doc => doc.number === queryDocId || baseDocIds.includes(doc.number.toString()))
  }

  const { Library } = require('../../doc-manager/library')
  const library = new Library()
  await library.init(docs)

  const mostSimilarDocs = library.getMostSimilarDocs(queryDocId, parseInt(nSimilarStr))
      .map(sim => {
        const { kind } = docs.find(doc => doc.number === sim.id)
        return { ...sim, kind }
      })
  console.dir(mostSimilarDocs, { depth: null })
}

(async () => {
  await main()
      .catch(err => console.error(err))
})()
