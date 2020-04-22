const { curry } = require('lodash/fp')


const isValidSub = sub => sub && sub.length >= 12

const isValidKey = key => key && key.length >= 0

const isValidTokenExp = exp => exp && exp.length >= 0

const isValidAud = aud => aud && aud.length >= 0

const isValidPid = aud => aud && aud.length > 0

const isValidGameId = gid => gid && gid.length > 0

const isValidAnswerId = gid => gid && gid.length > 0

const isValidConnectionId = aud => aud && aud.length > 0

const isValidLevel = level => level && !isNaN(level)

const isValidLimit = limit => limit && !isNaN(limit)

const isValidCategory = aud => aud && aud.length > 0

const isValidTableName = tableName => tableName && tableName.length > 0

const isValidLanguage = aud => aud && aud.length > 0

const isValidRequestId = id => id && id.length > 0

const isValidKeyId = kid => kid && kid.length > 0

const isValidQuestionId = qid => qid && qid.length > 0

const isValidUsername = username => username !== null && username.length > 0

const isValidPassword = pass => pass !== null && pass.length > 0

const isValidPrincipleId = pid => pid !== null && pid.length > 0

const isValidResource = rc => rc !== null && rc.length > 0

const isValidLatitude = lat => lat !== null && typeof lat === "number" && lat > 0

const isValidLongitude = long => long !== null && typeof long === "number" && long > 0

const isValidUserPool = pool => pool !== null && pool.length > 0

const isValidNumber = int => int !== null && typeof int === "number"

const isValidAmount = amount => amount !== null && typeof amount === "number"

const isValidCode = code => code !== null && typeof code === "string"

const isUrlValid = curry((regex, url) => {
    return url && url.match(regex)
})

const isValidQueueUrlSafe = curry((regex, url) => {
    return url && url.match(regex)
})

const isValidToken = token => token !== null && !token.length == 0

const isValidPlayerIds = ids => {
    if(!ids)
      return false
    const invalidIds = ids.filter(id => !isValidPid(id))
    return invalidIds.length == 0
}

const isValidAnswerIds = ids => {
    if(!ids)
      return false
    const invalidIds = ids.filter(id => !isValidAnswerId(id))
    return invalidIds.length == 0
}

const _isValidEmail = curry((regex, email) => {
    return email && email.match(regex)
})



module.exports = {
    isValidAmount,
    isValidAnswerId,
    isValidCode,
    isValidAnswerIds,
    isValidKeyId,
    isValidPrincipleId,
    isValidResource,
    isValidNumber,
    isValidLatitude,
    isValidLongitude,
    isValidPlayerIds,
    isValidQuestionId,
    isValidGameId,
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
        new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)),
    isValidQueueUrl: isValidQueueUrlSafe(
        new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)),
    isValidEmail: _isValidEmail(
        new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    )
}

