#!/usr/bin/env node

const { readFileSync } = require('node:fs')
const { proj } = require('../../../util/fs')
const { getComments } = require('../../../util/github')

const relevantFields = [
  'number',
  'title',
  'body'
]

async function main() {

  const issues = JSON.parse(readFileSync(proj('data/.private/issues/issues.json'), 'utf8'))

  const randomIssues = []
  for (let i = 0; i < 10; i++) {
    const r = Math.floor(Math.random() * issues.length)
    const issue = issues[r]
    const items = Object.fromEntries(Object.entries(issue)
        .filter(([key]) => relevantFields.includes(key))
        .concat([['comments', await getComments(issue)]])
    )
    randomIssues.push(items)
  }

  console.log(JSON.stringify(randomIssues, null, 2))

}

if (require.main === module) {
  main().catch(err => console.error(err))
}
