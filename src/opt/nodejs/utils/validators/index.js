const { curry } = require('lodash/fp')


const isValidSub = sub => sub && sub.length >= 12

const isValidKey = key => key && key.length >= 0

const isValidTokenExp = exp => exp && exp.length >= 0

const isValidAud = aud => aud && aud.length >= 0

const isValidPid = aud => aud && aud.length > 0

const isValidConnectionId = aud => aud && aud.length > 0

const isValidLevel = level => level && !isNaN(level)

const isValidLimit = limit => limit && !isNaN(limit)

const isValidCategory = aud => aud && aud.length > 0

const isValidTableName = tableName => tableName && tableName.length > 0

const isValidLanguage = aud => aud && aud.length > 0

const isValidRequestId = id => id && id.length > 0

const isValidUsername = username => username !== null && username.length > 0

const isValidPassword = pass => pass !== null && pass.length > 0

const isValidUserPool = pool => pool !== null && pool.length > 0

const isUrlValid = curry((regex, url) => {
    return url && url.match(regex)
})

const isValidToken = token => token !== null && !token.length == 0


module.exports = {
    isValidUserPool,
    isValidUsername,
    isValidPassword,
    isValidLimit,
    isValidTableName,
    isValidRequestId,
    isValidPid,
    isValidConnectionId,
    isValidLevel,
    isValidCategory,
    isValidLanguage,
    isValidSub,
    isValidToken,
    isUrlValid,
    isValidTokenExp,
    isValidAud,
    isValidKey,
    isValidUrl: isUrlValid(
        new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
}