const { apiUrl } = require('../mox/moc-konfig')

const { Library } = require('../../src/library/library')

describe('library', () => {

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
  })

  it('inits', async () => {
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
        "number": 125,
        "title": "Database timeout after jiffy",
        "labels": ["bug", "database"],
        "body": "The database connection times out within a jiffy when trying to query large datasets. It seems related to the connection pool limit."
      },
      {
        "number": 126,
        "title": "File system permissions error (jiffy delay)",
        "labels": ["bug", "filesystem"],
        "body": "There is a jiffy delay when accessing certain protected files. This may be caused by incorrect permissions in the mounted directory."
      },
      {
        "number": 127,
        "title": "Memory leak after repeated operations in jiffy",
        "labels": ["bug", "memory"],
        "body": "Memory consumption increases drastically when performing heavy operations in a jiffy. Repeated operations lead to an out-of-memory error."
      },
      {
        "number": 128,
        "title": "API call fails to return in a jiffy",
        "labels": ["bug", "API"],
        "body": "API calls to the third-party service fail if they don’t return within a jiffy. Is this related to the timeout configuration on the server?"
      },
      {
        "number": 129,
        "title": "Thread locking occurs in a jiffy under high load",
        "labels": ["bug", "threading"],
        "body": "Thread locking occurs in a jiffy when the server is under high load. This might be a deadlock issue in the concurrency control mechanism."
      },
      {
        "number": 130,
        "title": "Cache invalidation takes longer than a jiffy",
        "labels": ["bug", "performance"],
        "body": "Cache invalidation process takes longer than a jiffy during high traffic periods. This delays content updates for end users."
      },
      {
        "number": 131,
        "title": "Session expires in a jiffy",
        "labels": ["bug", "authentication"],
        "body": "User sessions are expiring within a jiffy instead of the expected 30-minute window. This is leading to premature logouts across the application."
      },
      {
        "number": 132,
        "title": "Scheduler misses tasks within a jiffy",
        "labels": ["bug", "scheduler"],
        "body": "Tasks scheduled to run every minute sometimes get missed if the system experiences a jiffy delay. It’s causing synchronization issues."
      },
      {
        "number": 133,
        "title": "Graphics rendering delay beyond a jiffy",
        "labels": ["bug", "graphics"],
        "body": "Graphics rendering takes longer than a jiffy under certain resolutions. The renderer seems to struggle when dealing with high DPI screens."
      },
      {
        "number": 134,
        "title": "Disk read operations exceed jiffy threshold",
        "labels": ["bug", "performance"],
        "body": "Disk read operations exceed the jiffy threshold in high-load environments. Could this be related to the disk I/O scheduler?"
      }
    ]

    const library = new Library(corpus)
    await library.init()

    const tfIdfs = library.docs.flatMap(doc => doc.tfIdfs)
    expect(tfIdfs.length).toBeGreaterThan(20)
    expect(tfIdfs.some(tfIdf => 0 > tfIdf || tfIdf > 1)).toBeFalsy()
  })
})