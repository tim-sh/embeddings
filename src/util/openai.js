const { getToken } = require('./auth')
const { vec } = require('./maths')

const { models, credentials } = require('../../data/.private/config')

async function complete(message, {
  model = 'GPT_4O',
  systemPrompt,
  seed = 5330,     // increase determinism
  topP = .5        // .1 → very uniform results, 1 → much randomness
} = {}) {

  const { deploymentUrl, costPerTokenInput, costPerTokenOutput, credentialsKey } = models[model]

  return fetch(`${deploymentUrl}/chat/completions?api-version=2024-06-01`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'AI-Resource-Group': 'default',
      Authorization: `Bearer ${await getToken(credentials[credentialsKey])}`
    },
    body: JSON.stringify({
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: message }
      ],
      top_p: topP,
      seed,
      response_format: { type: 'json_object' }
    })
  })
      .then(async response => {
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error.message)
        }
        const { choices: [{ message: { content: completion } }], usage: { prompt_tokens, completion_tokens } } = json
        const costs = prompt_tokens * costPerTokenInput + completion_tokens * costPerTokenOutput
        return {
          completion,
          costs
        }
      })
}

async function embed(stringOrStrArr, {
  model = 'EMBED_ADA_002'
} = {}) {

  if (!Array.isArray(stringOrStrArr)) {
    return doEmbed(stringOrStrArr, { model })
  }

  const embeddingByStr = new Map()
  const chunkSize = 2048

  for (let i = 0; i < stringOrStrArr.length; i += chunkSize) {
    const strChunk = stringOrStrArr.slice(i, i + chunkSize)
    const { embeddings } = await doEmbed(strChunk)
    for (let j = 0; j < strChunk.length; j++) {
      embeddingByStr.set(strChunk[j], embeddings[j])
    }
  }

  return {
    embeddings: stringOrStrArr.map(str => embeddingByStr.get(str))
  }
}

async function doEmbed(stringOrStrArr, {
  model = 'EMBED_ADA_002'
} = {}) {
  const { deploymentUrl, costPerToken, credentialsKey } = models[model]

  const newVar = await getToken(credentials[credentialsKey])
  return fetch(`${deploymentUrl}/embeddings?api-version=2024-02-01`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'AI-Resource-Group': 'default',
      Authorization: `Bearer ${newVar}`
    },
    body: JSON.stringify({
      input: stringOrStrArr,
      model
    })
  })
      .then(async response => {
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error.message)
        }
        const { data, usage: { total_tokens } } = json
        const embeddings = data.map(d => vec(d.embedding))
        const costs = total_tokens * costPerToken
        return {
          embeddings,
          costs
        }
      })
}

module.exports = {
  complete,
  embed
}
