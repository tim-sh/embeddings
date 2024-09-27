const { proj } = require('./fs')

const { github: { apiUrl, token, org, repo } } = require(proj('data/.private/config.json'))

async function getComments(issue, fields = ['body', 'user.type', 'user.login', 'author_association', 'labels'], replace = []) {
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
            const replacer = replace.find(([field]) => field === key)?.[1]
            if (replacer) {
              return [key, replacer(value)]
            }
            return [key, value]
          }
          const reducedVal = fields
              .reduce((acc, field) => {
                const [parent, child] = field.split('.')
                if (parent === key) {
                  const replacer = replace.find(([rf]) => field === rf)?.[1]
                  if (replacer) {
                    return { ...acc, [child]: replacer(value[child]) }
                  }
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
