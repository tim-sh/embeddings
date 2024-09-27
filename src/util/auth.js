async function getToken(credentials) {
  const res = await fetch(credentials.url + '/oauth/token?grant_type=client_credentials&response_type=token', {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${credentials.clientid}:${credentials.clientsecret}`).toString('base64')
    }
  })
  const { access_token } = await res.json()
  return access_token
}

module.exports = { getToken }
