const { curry } = require('lodash/fp')


const isValidSub = sub => sub && sub.length >= 12

const isValidKey = key => key && key.length >= 0

const isValidTokenExp = exp => exp && exp.length >= 0

const isValidAud = aud => aud && aud.length >= 0

const isUrlValid = curry((regex, url) => {
    return url && url.match(regex)
})

const isValidToken = token => token !== null && !token.length == 0


module.exports = {
    isValidSub,
    isValidToken,
    isUrlValid,
    isValidTokenExp,
    isValidAud,
    isValidKey,
    isValidUrl: isUrlValid(
        new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
}