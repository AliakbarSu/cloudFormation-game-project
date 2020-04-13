const { extracKid } = require('./kid-extractor')
const { fetchKeys } = require('./keys')
const { getClaims } = require('./claims')
const { checkTokenExpiry } = require('./token-validator')
const { isValidTokenExp, isValidToken, isValidUrl } = require("../validators/index")
const { invalidTokenError, failedToParseTokenError, invalidUrlError } = require("../errors/general")
const { curry } = require('lodash')



const findKey = curry((keys, kid) => {
    const foundKey = keys.find((key) => key.kid === kid)
    if(!foundKey) {
        return Promise.reject("PUBLIC_KEY_NOT_FOUND")
    }
    return Promise.resolve(foundKey)
})


const _parseToken = curry(async (extractKid, getClaims, fetchKeys, validateExpiry, keysURL, token) => {
    if(!isValidToken(token)) {
        return Promise.reject(invalidTokenError())
    }

    if(!isValidUrl(keysURL)) {
        return Promise.reject(invalidUrlError())
    }

    try {
        const kid = await extractKid(token)
        const keys = await fetchKeys(keysURL)
        const key = await findKey(keys, kid)
        const claims = getClaims(key, token)
        await validateExpiry(claims.exp, claims.aud)
        return claims
    }catch(err) {
        return Promise.reject(failedToParseTokenError())
    }

})


module.exports = {
    findKey,
    _parseToken,
    parseToken: _parseToken(extracKid, getClaims, fetchKeys, checkTokenExpiry)
} 