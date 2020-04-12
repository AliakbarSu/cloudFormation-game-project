const { curry } = require("lodash/fp")
const { isValidTokenExp, isValidAud } = require('../validators/index')



const tokenExpiredError = () => new Error("TOKEN_EXPIRED")

const notIssuedForTargetAudienceError = () => new Error("NOT_ISSUED_FOR_TARGET_AUDIENCE")

const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")

const invalidAudError = () => new Error("INVALID_AUD_PROVIDED")


const getTimeInMills = curry((floor, time) => floor(time / 1000))

const validate = curry((currentTime, client, token_expiration, aud) => {
    if (currentTime > token_expiration) 
        return Promise.reject(tokenExpiredError())
    else if (aud !== client)
        return Promise.reject(tokenExpiredError())
    else
        return Promise.resolve(true)
})


const isTokenExpired = curry((expiryValidator, audValidator, floorFunc, time, client, expiry, aud) => {
    if(!expiryValidator(expiry)) return Promise.reject(invalidTokenError())
    if(!audValidator(aud)) return Promise.reject(invalidAudError())
    return validate(getTimeInMills(floorFunc, time), client, expiry, aud)
})

module.exports = {
    tokenExpiredError,
    notIssuedForTargetAudienceError,
    validate,
    getTimeInMills,
    isTokenExpired,
    checkTokenExpiry: isTokenExpired(isValidTokenExp, isValidAud, Math.floor, new Date())
}