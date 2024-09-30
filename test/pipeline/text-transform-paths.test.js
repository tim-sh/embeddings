const { textTransformPaths } = require('../../src/pipeline/text-transform-paths')

describe('text-trim-path-prefixes.test', () => {
  it('should trim Unix paths', async () => {
    const text = `
    /home/user/Documents/file.txt
    (/home/user/Documents/file.txt
    '/home/user/Documents/file.txt
    /Users/bob/Documents/file.txt
    '/Users/bob/Documents/file.txt'
    `

    const trimmed = textTransformPaths(text)
    expect(trimmed).toEqual(`
    Documents/file.txt
    (Documents/file.txt
    'Documents/file.txt
    Documents/file.txt
    'Documents/file.txt'
    `)
  })

  it('should trim Windows paths', async () => {
    const text = `
    C:\\Users\\User\\Documents\\file.txt
    (E:\\Users\\bob\\Documents\\file.txt)
    foo
    'Z:\\Users\\bob\\Documents\\file.txt
    fooF:\\Users\\bob\\Documents\\file.txt
    bar
    `

    const trimmed = textTransformPaths(text)
    expect(trimmed).toEqual(`
    Documents\\file.txt
    (Documents\\file.txt)
    foo
    'Documents\\file.txt
    fooF:\\Users\\bob\\Documents\\file.txt
    bar
    `)
  })

  it('should trim network paths', async () => {
    const text = `
    //localhost/c$/path/to/file.txt
    (//localhost/c$/path/to/file.txt)
    '//localhost/c$/path/to/file.txt'
    `

    const trimmed = textTransformPaths(text)
    expect(trimmed).toEqual(`
    /path/to/file.txt
    (/path/to/file.txt)
    '/path/to/file.txt'
    `)
  })

  it('should trim node_modules paths', async () => {
    const text = `
    any/path/to/node_modules/foo/bar
    `

    const trimmed = textTransformPaths(text)
    expect(trimmed).toEqual(`
    node_modules/foo/bar
    `)
  })

})
