const stopword = require('stopword')
const { eng, deu } = stopword

function tokensRemoveStopwords(tokens) {
    return stopword.removeStopwords(tokens, [
        ...eng,
        ...deu,
        'hallo',
        'hello',
        'hi',
        'hey',
        'cheers',
        'thanks',
        'thank',
        'danke'
    ])
}

module.exports = {
    tokensRemoveStopwords
}
