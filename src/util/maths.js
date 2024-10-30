const Decimal = require('decimal.js')

/**
 * Convert an array of numbers to an array of Decimal numbers, called a vector.
 * @param arr {number[]} - Array of numbers
 * @return {Decimal[]} - Array of Decimal numbers
 */
function vec(arr) {
  return arr.map(e => new Decimal(e))
}

/**
 * Convert an array of Decimal numbers (a vector) to an array of numbers.
 * @param vec {Decimal[]} - Array of Decimal numbers
 * @return {number[]} - Array of numbers
 */
function arr(vec) {
  return vec.map(e => e.toNumber())
}

/**
 * Calculate the mean of an array of Decimal numbers.
 * @param arr {Decimal[]} - Array of Decimal numbers
 * @return {Decimal} - Mean of the array
 */
function mean(arr) {
  return arr.reduce((sum, x) => sum.plus(x), new Decimal(0)).div(arr.length)
}

/**
 * Calculate the mean of an array of vectors.
 * @param arrOfVec {Decimal[][]} - Array of vectors
 * @param weights {Decimal[]} - Weights for the vectors
 * @return {Decimal[]} - Mean of the array of vectors
 */
function meanVec(arrOfVec, weights = undefined) {
  if (!arrOfVec.length) {
    return []
  }
  const dim = arrOfVec[0].length
  return weights
      ? Array.from({ length: dim }, (_, i) => mean(arrOfVec.map((vec, j) => vec[i].mul(weights[j]))))
      : Array.from({ length: dim }, (_, i) => mean(arrOfVec.map(vec => vec[i])))
}

/**
 * Calculate the dot product of two vectors.
 * @param vec {Decimal[]} - First vector
 * @param wec {Decimal[]} - Second vector
 * @return {Decimal} - Dot product of the two vectors
 */
function dot(vec, wec) {
  return vec.reduce((sum, ai, i) => sum.plus(ai.mul(wec[i])), new Decimal(0))
}

/**
 * Subtract two vectors.
 * @param vec {Decimal[]} - First vector
 * @param wec {Decimal[]} - Second vector
 * @return {Decimal[]} - Result of subtracting the second vector from the first
 */
function minus(vec, wec) {
  return vec.map((e, i) => e.sub(wec[i]))
}

/**
 * Calculate the exponent of a number.
 * @param a {Decimal} - Number
 * @param exp {number} - Exponent (integer)
 * @return {Decimal} - Result of raising the number to the exponent
 */
function exp(a, exp) {
  let result = a
  for (let i = 1; i < exp; i++) {
    result = result.mul(a)
  }
  return result
}

/**
 * Calculate the length (magnitude, norm) of a vector.
 * @param vec {Decimal[]} - Vector
 * @return {Decimal} - Length of the vector
 */
function length(vec) {
  return vec.reduce((sum, e) => sum.add(exp(e, 2)), new Decimal(0)).sqrt()
}

/**
 * Normalize a vector.
 * @param vec {Decimal[]} - Vector
 * @return {Decimal[]} - Normalized vector
 */
function normalize(vec) {
  const l = length(vec)
  return vec.map(e => e.div(l))
}

/**
 * Compare two numbers in ascending order.
 * @param a {number} - First number
 * @param b {number} - Second number
 * @return {number} - Comparison result
 */
function ascending(a, b) {
  return a - b
}

/**
 * Compare two numbers in descending order.
 * @param a {number} - First number
 * @param b {number} - Second number
 * @return {number} - Comparison result
 */
function descending(a, b) {
  return b - a
}

module.exports = {
  vec,
  arr,
  mean,
  meanVec,
  dot,
  minus,
  exp,
  length,
  normalize,
  ascending,
  descending
}
