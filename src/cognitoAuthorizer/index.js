let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, getOr, get } = require("lodash/fp")
const { parseToken } = require(layerPath + 'utils/auth/index')
const { isValidToken, isValidResource } = require(layerPath + 'utils/validators/index')
const { invalidTokenError } = require(layerPath + 'utils/errors/general')
const { generateAllow } = require('./generatePolicies')


const failedToAuthenticateUserError = () => new Error("FAILED_TO_AUTHENTICATE_USER")
const unAuthorizedError = () => new Error("UN_AUTHORIZED")
const invalidMethodArnError = () => new Error("INVALID_METHOD_ARN")

const handlerSafe = curry(async (parseToken, event) => {

    const queryStringParameters = getOr({}, "queryStringParameters", event)
    const token = get("Authorizer", queryStringParameters)
    const methodArn = get("methodArn", event)

    if(!isValidResource(methodArn))
        return Promise.reject(invalidMethodArnError())

    if(!isValidToken(token))
        return Promise.reject(invalidTokenError())
    
    try {
        const claims = await parseToken(token).catch(err => {
            console.log(err)
            return Promise.reject(unAuthorizedError())
        })
        const allowPolicy = await generateAllow('me', methodArn, claims.email)
        return Promise.resolve(allowPolicy)
    }catch(err) {
        console.error(err)
        if(err.message === unAuthorizedError().message) {
            return Promise.reject(err)
        }
        return Promise.reject(failedToAuthenticateUserError())
    }
})


module.exports = {
    failedToAuthenticateUserError,
    unAuthorizedError,
    invalidMethodArnError,
    handlerSafe,
    handler: handlerSafe(parseToken(process.env.KEYS_URL))
}