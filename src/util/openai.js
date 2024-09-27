const { proj } = require('./fs')
const { models, credentials } = require(proj('data/.private/config.json'))
const { getToken } = require('./auth')

async function completions(message, {
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

module.exports = { completions }
