#!/usr/bin/env node

const { writeFileSync } = require('node:fs')
const { proj } = require('../../../util/fs')

async function main() {

  const issues = require(proj('data/.private/issues/issues.json'), 'utf8')

  issues.forEach(issue => issue.labels = issue.labels?.map(label => label.name))

  writeFileSync(proj('data/.private/issues/issues.label-names.json'), JSON.stringify(issues, null, 2))

}

main().catch(err => console.error(err))
