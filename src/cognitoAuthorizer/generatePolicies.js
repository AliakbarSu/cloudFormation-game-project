let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry } = require('lodash/fp')

const { generatePolicy } = require('./generatePolicy')

const {
    isValidPrincipleId,
    isValidResource,
    isValidEmail
} = require(layerPath + 'utils/validators/index')
const {
    invalidPrincipleIdError,
    invalidResourceError,
    invalidEmail
} = require(layerPath + 'utils/errors/general')



exports.generateAllow = curry((principalId, resource, userEmail) => {
    if(!isValidPrincipleId(principalId))
        return Promise.reject(invalidPrincipleIdError())

    if(!isValidResource(resource))
        return Promise.reject(invalidResourceError())

    if(!isValidEmail(userEmail))
        return Promise.reject(invalidEmail())

    return Promise.resolve(generatePolicy(principalId, "Allow", resource, userEmail))
})

exports.generateDeny = curry((principalId, resource, userEmail) => {
    if(!isValidPrincipleId(principalId))
        return Promise.reject(invalidPrincipleIdError())

    if(!isValidResource(resource))
        return Promise.reject(invalidResourceError())

    if(!isValidEmail(userEmail))
        return Promise.reject(invalidEmail())

    return Promise.resolve(generatePolicy(principalId, "Deny", resource, userEmail))
})


