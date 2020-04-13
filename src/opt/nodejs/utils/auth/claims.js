const { curry } = require("lodash/fp")
const jose = require('node-jose')
const { isValidToken, isValidKey } = require('../validators/index')


const signatureVerificationFailedError = () => new Error("SIGNATURE_VERIFICATION_FAILED")

const invalidKeyError = () => new Error("INVALID_KEY_PROVIDED")
const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")


const createVerify = curry((verifyCreator, key) => {
    return verifyCreator(key)
        .then(verifier => verifier.verify)
        .catch(() => Promise.reject(signatureVerificationFailedError()))
})

const verify = curry((verifier, token) => {
    return verifier(token).catch(() => Promise.reject(signatureVerificationFailedError()))
})

const procesKey = curry((processor, key) => {
    return new Promise(success => {
        const result = processor(key)
        success(result)
    })
})

const getClaimsSafe = curry((processor, verifyCreator, key, token) => {
    if(!isValidKey(key)) {
        return Promise.reject(invalidKeyError())
    }
    if(!isValidToken(token)) {
        return Promise.reject(invalidTokenError())
    }
    return procesKey(processor, key)
    .then(processedKey => createVerify(verifyCreator, processedKey))
    .then(verifer => verify(verifer, token))
})

module.exports = {
    signatureVerificationFailedError,
    invalidKeyError,
    invalidTokenError,
    verify,
    createVerify,
    procesKey,
    getClaimsSafe,
    getClaims: getClaimsSafe(jose.JWK.asKey, jose.JWS.createVerify) 
}