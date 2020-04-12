const { curry } = require("lodash/fp")
const jose = require('node-jose')
const { isValidToken, isValidKey } = require('../validators/index')


const signatureVerificationFailedError = () => new Error("SIGNATURE_VERIFICATION_FAILED")

const invalidKeyError = () => new Error("INVALID_KEY_PROVIDED")
const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")


const createVerify = curry((verifyCreator, key) => {
    return new Promise(success => {
        const verifier = verifyCreator(key)
        success(verifier.verify)
    })
})

const verify = curry((verifier, token) => {
    return verifier(token).catch(() => signatureVerificationFailedError())
})

const procesKey = curry((processor, key) => {
    return new Promise(success => {
        const result = processor(key)
        success(result)
    })
})

const getClaimsSafe = curry((processor, verifyCreator, tokenValidator, keyValidator, key, token) => {
    if(!keyValidator(key)) {
        return Promise.reject(invalidKeyError())
    }
    if(!tokenValidator(token)) {
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
    getClaims: getClaimsSafe(jose.JWK.asKey, jose.JWS.createVerify, isValidToken, isValidKey) 
}