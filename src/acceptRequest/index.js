let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"


const { curry, get } = require("lodash/fp")
const { convertSubToUid } = require(layerPath + "utils/auth/convert-to-uid")
const { 
    isValidToken, 
    isValidRequestId } = require(layerPath + 'utils/validators/index')
const { 
    failedToProcessAcceptRequestError,
    invalidTokenError, 
    invalidRequestIdError } = require(layerPath + 'utils/errors/general')

const { acceptRequest } = require(layerPath + "models/request.model")
const { parseToken } = require(layerPath + "utils/auth/index")



const acceptRequestHandler = curry(async (acceptRequest, parseToken, convertSubToUid, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const token = get("token", event)
    const requestId = get("requestId", event)

    if(!isValidToken(token)) {
        console.log(invalidTokenError())
        return Promise.reject(invalidTokenError())
    }
        
    if(!isValidRequestId(requestId)) {
        console.log(invalidRequestIdError())
        return Promise.reject(invalidRequestIdError())
    }
        
    try {
        const claims = await parseToken(process.env.KEYS_URL, token)
        console.log(claims)
        const pid = await convertSubToUid(get("sub", claims));
        const request = await acceptRequest(requestId, pid)
        return request
    }catch(err) {
        console.error(failedToProcessAcceptRequestError(), err);
        return Promise.reject(failedToProcessAcceptRequestError())
    } 
})

module.exports = {
    acceptRequestHandler,
    handler: acceptRequestHandler(acceptRequest, parseToken, convertSubToUid)
}