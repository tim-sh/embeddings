#!/usr/bin/env node

const { complete } = require('../../../util/openai')
const { writeFileSync } = require('node:fs')
const { proj } = require('../../../util/fs')
const { rndStr } = require('../../../util/format')

const n = 10
const id = `_${rndStr(5)}`

const allIssues = []

for (const [ref, kind] of [['the same problem but phrased differently', 'same'], ['a different problem', 'diff']]) {
  const message = `
    Generate ${n} different sample Github issues each referring to ${ref}.
    
    Make the body of each of the ${n} issues between 5 and 10 sentences long, with some technical terms or stack traces mixed in.
    Bodies may be multi-line and should strongly vary between issues while still keeping reference to the same problem.
    
    Also include in each issue:
      - between 1 and 3 labels
      - between 1 and 3 comments, each with 1 to 2 sentences.
        
    Each label should refer to a software component but not to a type of issue, urgency, or priority.
    
    Use the following output structure. Respond with a JSON object containing ${n} issues in total:

    {
      "issues": [
        {
          "number": 16352,
          "title": "…",
          "labels": [ "…", "…", "…" ],
          "body": "…",
          "comments": [ "…" ]
        },
        {
          "number": 3853,
          "title": "…",
          "labels": [ "…", "…" ],
          "body": "…",
          "comments": [ "…", "…", "…" ]
        },
        {
          "number": 2634,
          "title": "…",
          "labels": [ "…" ],
          "body": "…",
          "comments": [ "…", "…" ]
        }, // etc.
      ]
    }
  `
  complete(message)
      .then(result => {
        const issues = JSON.parse(result.completion.trim())
            .issues
            .map(issue => ({ ...issue, kind }))
        allIssues.push(...issues)
        return writeFileSync(proj(`data/samples/issues/issues.${n}.${kind}.${id}.json`), JSON.stringify(issues, null, 2), 'utf8')
      })
      .then(() => writeFileSync(proj(`data/samples/issues/issues.${n}.all.${id}.json`), JSON.stringify(allIssues, null, 2), 'utf8'))
}
