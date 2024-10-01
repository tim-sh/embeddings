const { textTransformLowercase } = require('../../src/pipeline/text-transform-lowercase')

describe('text-transform-lowercase', () => {
  it('should lower the case', async () => {
    expect(textTransformLowercase('Hello, World!')).toEqual('hello, world!')
  })
})
