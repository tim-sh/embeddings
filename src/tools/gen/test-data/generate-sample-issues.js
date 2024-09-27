#!/usr/bin/env node

const { completions } = require('../../../util/openai')
const { writeFileSync } = require('node:fs')
const { proj } = require('../../../util/fs')
const { rndStr } = require('../../../util/format')

const n = 10

for (const [ref, label] of [['the same problem but phrased differently', 'same'], ['different problems', 'diff']]) {
  completions(`
    Think up ${n} different sample Github issues. It is important that they all refer to ${ref}.
    
    Make the bodies between 5 and 10 sentences long, with some technical terms or stack traces mixed in.
    Bodies may be multi-line and should strongly vary between issues while still keeping reference to the same problem.
    
    Also include in each issue:
      - between 1 and 3 labels
      - between 1 and 3 comments, each with 1 to 2 sentences.
        
    Each label should refer to a software component but not to a type of issue, urgency, or priority.
    
    Use the following as an example and respond in JSON in the same format but with different values

    [
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
      }
    ]
    
    Remember to generate ${n} issues in total.
  `).then(result =>
        writeFileSync(proj(`data/samples/issues/issues.${n}.${label}._${rndStr(5)}.json`), JSON.stringify(JSON.parse(result.completion.trim()), null, 2), 'utf8')
  )
}
