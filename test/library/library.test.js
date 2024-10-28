const { apiUrl, tokenUrl, deploymentUrl, outputLength } = require('../mox/moc-konfig')

const { Library } = require('../../src/docs/library')
const pipeline = require('../../src/pipeline')

describe('library', () => {

  let iDoc

  beforeAll(async () => {
    const { default: fetchMock } = await import('fetch-mock')
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/123/comments`, [
      { body: 'Severe problem', user: { type: 'User', login: 'user1' }, author_association: 'MEMBER' },
      { body: `I'm a tea bot`, user: { type: 'Bot' } },
      { body: 'Have you turned it on', user: { type: 'User' }, created_at: '2001-01-01T01:00:00Z' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/124/comments`, [
      { body: 'This is a known problem' },
      { body: `It's indeed related to the reconcile process` }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/125/comments`, [
      { body: 'This might be caused by connection pooling issues.' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/126/comments`, [
      { body: 'Have you checked the file permissions on the mounted drive?' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/127/comments`, [
      { body: 'Memory leaks can often be caused by holding on to unused references.' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/128/comments`, [
      { body: 'It looks like the API is timing out. Consider increasing the timeout settings.' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/129/comments`, [
      { body: 'Deadlocks under high load can be tricky. Check your thread synchronization.' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/130/comments`, [
      { body: 'This sounds like a cache invalidation issue. How frequently is it being cleared?' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/131/comments`, [
      { body: 'Premature session expiration might be due to a misconfigured session timeout.' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/132/comments`, [
      { body: 'Missed tasks could be due to event loop delays or scheduling conflicts.' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/133/comments`, [
      { body: 'Rendering delay might be related to how the system handles high DPI scaling.' }
    ])
    fetchMock.mock(`${apiUrl}/repos/org/repo/issues/134/comments`, [
      { body: 'Disk I/O contention could be causing these delays under high load.' }
    ])
    fetchMock.mock(`${tokenUrl}/oauth/token?grant_type=client_credentials&response_type=token`, { access_token: 'token' })
    fetchMock.mock(`${deploymentUrl}/embeddings?api-version=2024-02-01`, (url, req) => {
      iDoc++
      const input = JSON.parse(req.body.toString()).input
      return {
        data: Array.from({ length: input.length }, (_, g) => {
          const firstByte = input[g].charCodeAt(0) & 0xff // start deterministically for each input string
          return {
            // Simulate high similarity between first two documents
            embedding: Array.from({ length: outputLength }, (_, i) => (iDoc < 2 && i < 5 ? 1 - i/2 : ((firstByte + i) % 100) / 100))  // values in [-1, 1)
          }
        }),
        usage: { total_tokens: 100 }
      }
    })
  })

  beforeEach(async () => {
    iDoc = -1
  })

  const corpus = [
    {
      number: 123,
      title: 'Technical issue with rendering',
      labels: ['bug'],
      body: `When I try to render the page, it doesn't work. An error message is displayed: "Severe problem with renderer: 123".`
    },
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
      'title': 'File system permissions error (jiffy delay)',
      'labels': ['bug', 'filesystem'],
      'body': 'There is a jiffy delay when accessing certain protected files. This may be caused by incorrect permissions in the mounted directory.'
    },
    {
      'number': 127,
      'title': 'Memory leak after repeated operations in jiffy',
      'labels': ['bug', 'memory'],
      'body': 'Memory consumption increases drastically when performing heavy operations in a jiffy. Repeated operations lead to an out-of-memory error.'
    },
    {
      'number': 128,
      'title': 'API call fails to return in a jiffy',
      'labels': ['bug', 'API'],
      'body': 'API calls to the third-party service fail if they don’t return within a jiffy. Is this related to the timeout configuration on the server?'
    },
    {
      'number': 129,
      'title': 'Thread locking occurs in a jiffy under high load',
      'labels': ['bug', 'threading'],
      'body': 'Thread locking occurs in a jiffy when the server is under high load. This might be a deadlock issue in the concurrency control mechanism.'
    },
    {
      'number': 130,
      'title': 'Cache invalidation takes longer than a jiffy',
      'labels': ['bug', 'performance'],
      'body': 'Cache invalidation process takes longer than a jiffy during high traffic periods. This delays content updates for end users.'
    },
    {
      'number': 131,
      'title': 'Session expires in a jiffy',
      'labels': ['bug', 'authentication'],
      'body': 'User sessions are expiring within a jiffy instead of the expected 30-minute window. This is leading to premature logouts across the application.'
    },
    {
      'number': 132,
      'title': 'Scheduler misses tasks within a jiffy',
      'labels': ['bug', 'scheduler'],
      'body': 'Tasks scheduled to run every minute sometimes get missed if the system experiences a jiffy delay. It’s causing synchronization issues.'
    },
    {
      'number': 133,
      'title': 'Graphics rendering delay beyond a jiffy',
      'labels': ['bug', 'graphics'],
      'body': 'Graphics rendering takes longer than a jiffy under certain resolutions. The renderer seems to struggle when dealing with high DPI screens.'
    },
    {
      'number': 134,
      'title': 'Disk read operations exceed jiffy threshold',
      'labels': ['bug', 'performance'],
      'body': 'Disk read operations exceed the jiffy threshold in high-load environments. Could this be related to the disk I/O scheduler?'
    }
  ]

  it('computes n-grams, TF-IDFs and mean embedding for each document', async () => {
    const library = new Library()
    await library.init(corpus, pipeline.default.GITHUB_ISSUE)

    expect(library.docs.length).toBe(12)

    const tfIdfs = {}
    library.docs.forEach(doc => {
      expect(doc.tfIdfs).toHaveLength(doc.ngrams.length)
      doc.ngrams.forEach((ngram, i) => {
        if (['when', 'jiffy', 'reconcile'].includes(ngram)) {
          tfIdfs[ngram] = doc.tfIdfs[i]
        }
      })
      expect(doc.embedding).toHaveLength(outputLength)
      doc.embedding.forEach(value => {
        // components are in [-1, 1], since OpenAI embeddings are unit vectors
        expect(value.toNumber()).toBeGreaterThanOrEqual(-1)
        expect(value.toNumber()).toBeLessThanOrEqual(1)
      })
    })

    expect(tfIdfs['when']).toBeLessThan(tfIdfs['jiffy'])
    expect(tfIdfs['jiffy']).toBeLessThan(tfIdfs['reconcile'])
  })

  it('adds a doc', async () => {
    const library1 = new Library()
    await library1.init(corpus.slice(0, 11), pipeline.default.GITHUB_ISSUE)

    await library1.addDoc(corpus[11])

    const library2 = new Library()
    await library2.init(corpus, pipeline.default.GITHUB_ISSUE)

    expect(library1.docs.length).toBe(library2.docs.length)

    for (let i = 0; i < library2.docs.length; i++) {
      expect(library1.docs[i].ngrams).toEqual(library2.docs[i].ngrams)
    }
  })

  it('gets most similar doc', async () => {
    const library = new Library()
    await library.init(corpus, pipeline.default.GITHUB_ISSUE)

    const similarDocs = library.getMostSimilarDocs(123, 7)

    expect(similarDocs).toHaveLength(7)
    similarDocs.forEach(({ id, cosSimilarity }, i) => {
      expect(library.docs.some(doc => doc.id === id)).toBe(true)
      expect(cosSimilarity).toBeGreaterThanOrEqual(similarDocs[i + 1]?.cosSimilarity ?? 0)
    })

    expect(similarDocs[0].id).toBe(124)
  })
})
