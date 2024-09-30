const { proj } = require('./fs')

const { github: { apiUrl, token, org, repo } } = require(proj('data/.private/config.json'))

async function getComments(issue, fields = ['body', 'user.type']) {
  const { number } = issue
  const url = `${apiUrl}/repos/${org}/${repo}/issues/${number}/comments`
  const comments = await fetch(url, {
    headers: {
      Authorization: `token ${token}`
    }
  }).then(res => res.json())
  return comments.map(c => {
    const cEntries = Object.entries(c)
        .map(([key, value]) => {
          if (fields.includes(key)) {
            return [key, value]
          }
          const reducedVal = fields
              .reduce((acc, field) => {
                const [parent, child] = field.split('.')
                if (parent === key) {
                  return { ...acc, [child]: value[child] }
                }
                return acc
              }, {})
          if (Object.keys(reducedVal).length) {
            return [key, reducedVal]
          }
        }).filter(Boolean)
    return Object.fromEntries(cEntries)
  })
}

module.exports = {
  getComments
}
