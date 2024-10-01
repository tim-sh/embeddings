async function runPipeline(pipeline, input) {
  return pipeline.reduce(async (result, fn) => fn(await result), input)
}

module.exports = {
  runPipeline
}
