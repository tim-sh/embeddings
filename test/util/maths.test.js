describe('maths', () => {
  describe('mean', () => {
    it('calculates the mean of an array', () => {
      const { mean } = require('../../src/util/maths')
      expect(mean([1, 2, 3])).toBe(2)
    })
  })

  describe('meanArr', () => {
    it('calculates the mean of an array of arrays', () => {
      const { meanArr } = require('../../src/util/maths')
      expect(meanArr([[1, 2], [3, 4], [5, 6]])).toEqual([3, 4])
    })
  })

  describe('dot', () => {
    it('calculates the dot product of two arrays', () => {
      const { dot } = require('../../src/util/maths')
      expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
    })
  })
})

