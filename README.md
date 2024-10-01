# Embeddings Tools

Collection of Node.js tools to compare documents using embeddings.
Documents are stored in a _library_, which currently supports GitHub issues only.

## Input Data

The input data is a collection of documents in the following format:
```js
[
  {
    number: 4711,
    title: 'Title of the issue',
    labels: ['label1', 'label2'],
    body: 'Issue description'
  }, // …
]
```

It can be retrieved from the GitHub [list repository issues](https://docs.github.com/en/rest/issues/issues#list-repository-issues) API.

## Data Transformation

Each of the document is transformed into a vector using a pipeline with the following steps, each feeding into the next:

1. Each label is converted into a simple string unless it is already a string.
2. Comments are received from the [list issue comments](https://docs.github.com/en/rest/issues/comments#list-issue-comments) API and converted into a string.
3. The issue is **transformed into a text string**. (This currently includes the title, body, and comments.)
4. Code delimiters are removed.
5. Stacks are reduced by omitting irrelevant frames. Leading and trailing whitespace is removed in the same step. (This step is somewhat opinionated.)
6. Local paths are stripped of common prefixes. (This step is somewhat opinionated.)
7. The string is converted to lowercase.
8. The string is **transformed into tokens** (tokenized).
9. Stopwords are removed.
10. The tokens are **transformed into n-grams**.
11. The TF-IDF is calculated for each n-gram. All TF-IDF values are normalized to the range [0, 1].
12. For each document, the n-grams are filtered by a TF-IDF threshold (0.1 by default).
13. Each remaining n-gram is **transformed into an embedding vector** using the OpenAI [embeddings](https://platform.openai.com/docs/api-reference/embeddings) API.
14. The embeddings are **transformed into a single vector** for the document by calculating their mean value.

## Similarity Calculation

The similarity between two documents is computed as the cosine similarity between their embeddings.
Since OpenAI embeddings are normalized, cosine similarity is identical with scalar (dot) product.

## Usage

```js
const corpus = [
  {
    number: 124,
    title: 'Cannot render page',
    labels: ['bug'],
    body: `I get an error message: "Known problem with renderer: 124 (failed to reconcile)". It may be related to the reconcile process.`
  },
  {
    'number': 125,
    'title': 'Database timeout after jiffy',
    'labels': ['bug', 'database'],
    'body': 'The database connection times out within a jiffy when trying to query large datasets. It seems related to the connection pool limit.'
  },
  {
    'number': 126,
    'title': 'Cannot connect to database',
    'labels': ['bug', 'database'],
    'body': 'The database connection fails with an error message: "Connection refused". It may be related to the connection string.'
  }
]

const Library = require('src/library/library')
const library = new Library()
await library.init(corpus)

const newDoc = {
  number: 127,
  title: 'Failure to query in a jiffy',
  labels: ['database', 'bug'],
  body: 'When I send a large query to the database, it times out before a jiffy has passed. Is there a connection pool limit?'
}

await library.addDoc(newDoc)
console.dir(library.getMostSimilarDocs(127))
```

## Configuration

There are two places for config settings. Adjust them as needed before running the code:

- [data/.private/config.json](data/.private/config.json). This file is checked in as a template and holds private settings.
  - ⚠️ **Do not check in your actual settings** (e.g. in a fork)! Run `git update-index --assume-unchanged data/.private/config.json` to prevent accidental check-ins.
- [data/config.js](data/config.js). This file is checked in and holds public settings.

## Known Issues

- Settings are currently local to this repo.
- GitHub org is currently required.
- OpenAI API version is currently fixed.
- Maximum token count is currently ignored.
- Settings are missing to control:
  - whether labels are included in the text
  - the set of pipeline functions to use
  - the parameters of the pipeline functions
- Cost calculation is missing.
- The code is currently in-memory only.
