#!/usr/bin/env node

async function main() {
  const { resolve } = require('node:path')
  const assert = require('node:assert')

  const [, , docsJsonPath, queryDocJsonPathOrId, nSimilarStr = '10'] = process.argv
  assert(docsJsonPath, 'Missing docsJsonPath')
  assert(queryDocJsonPathOrId, 'Missing queryDocJsonPathOrId')

  const docs = require(resolve(docsJsonPath))

  const { Library } = require('../../library/library')
  const library = new Library()
  await library.init(docs)

  let queryDocId = parseInt(queryDocJsonPathOrId)
  if (isNaN(queryDocId)) {
    const queryDoc = require(resolve(queryDocJsonPathOrId))
    await library.addDoc(queryDoc)
    queryDocId = queryDoc.number
  }

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
