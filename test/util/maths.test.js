const Decimal = require('decimal.js')
const { vec, arr, mean, meanVec, dot, minus, exp, length, normalize } = require('../../src/util/maths')

function dec(v) {
  return new Decimal(v)
}

describe('maths', () => {
  describe('mean', () => {
    it('calculates the mean of an array', () => {
      expect(mean(vec([1, 2, 3])).toNumber()).toBe(2)
    })
  })

  describe('meanVec', () => {
    it('calculates the mean of an array of arrays', () => {
      expect(arr(meanVec([vec([1, 2]), vec([3, 4]), vec([5, 6])]))).toEqual([3, 4])
    })
    it('calculates the weighted mean of an array of arrays', () => {
      expect(meanVec([vec([1, 3]), vec([3, 4]), vec([5, 1])], vec([.1, .5, 1]))).toEqual([dec(2.2), dec(1.1)])
    })
  })

  describe('dot', () => {
    it('calculates the dot product of two arrays', () => {
      expect(dot(vec([1, 2, 3]), vec([4, 5, 6])).toNumber()).toBe(32)
    })
  })

  describe('minus', () => {
    it('subtracts two arrays', () => {
      expect(arr(minus(vec([1, 2, 3]), vec([4, 5, 6])))).toEqual([-3, -3, -3])
    })
  })

  describe('exp', () => {
    it('calculates the exponent of a number', () => {
      expect(exp(new Decimal(2), 3).toNumber()).toBe(8)
    })
  })

  describe('length', () => {
    it('calculates the length of a vector', () => {
      expect(length(vec([3, 4])).toNumber()).toBe(5)
    })
  })

  it('normalize', () => {
    const a = normalize(vec(Array.from({ length: 1536 }, () => Math.random())))
    const theta = 1e-6, c = Math.cos(theta), s = Math.sin(theta)
    let b = [...a]
    b[0] = a[0].mul(c).sub(a[1].mul(s))
    b[1] = a[0].mul(s).add(a[1].mul(c))
    expect(dot(a, b).toNumber()).toBeGreaterThan(c) // angle between a and b is less than theta
  })

})
