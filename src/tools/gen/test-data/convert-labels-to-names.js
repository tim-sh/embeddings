#!/usr/bin/env node

const { writeFileSync } = require('node:fs')
const { fromHere } = require('../../../util/fs')

async function main() {

  const issues = require('../../../../data/.private/issues/issues.json')

  issues.forEach(issue => issue.labels = issue.labels?.map(label => label.name))

  writeFileSync(fromHere('../../../../data/.private/issues/issues.label-names.json'), JSON.stringify(issues, null, 2))

}

main().catch(err => console.error(err))
