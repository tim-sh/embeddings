#!/usr/bin/env node

const { proj } = require('../../../util/fs')
const { getComments } = require('../../../util/github')
const { writeFileSync } = require('node:fs')
const { hashed } = require('../../../util/format')

const relevantFields = [
  'number',
  'title',
  'labels',
  'body'
]

async function main() {

  const issues = require(proj('data/.private/issues/issues.label-names.json'), 'utf8')

  const randomIssues = []
  for (let i = 0; i < 36; i++) {
    const r = Math.floor(Math.random() * issues.length)
    const issue = issues[r]
    const items = Object.fromEntries(Object.entries(issue)
        .filter(([key]) => relevantFields.includes(key))
        .concat([['comments', await getComments(issue)]])
    )
    randomIssues.push(items)
  }

  const str = JSON.stringify(randomIssues, null, 2)
      .replaceAll(/\b[di]\d{6}\b/gi, username => hashed(username))
  writeFileSync(proj('data/.private/issues/issues.rnd.json'), str)

}

main().catch(err => console.error(err))
