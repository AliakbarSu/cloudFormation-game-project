let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"


const { curry, get } = require("lodash/fp")
const { convertSubToUid } = require(layerPath + "utils/auth/convert-to-uid")
const { 
    isValidToken, 
    isValidRequestId } = require(layerPath + 'utils/validators/index')
const { 
    failedToProcessRejectRequestError,
    invalidTokenError, 
    invalidRequestIdError } = require(layerPath + 'utils/errors/general')

const { rejectRequest } = require(layerPath + "models/request.model")
const { parseToken } = require(layerPath + "utils/auth/index")



const rejectRequestHandler = curry(async (rejectRequest, parseToken, convertSubToUid, event, context) => {
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
        const request = await rejectRequest(requestId, pid)
        return request
    }catch(err) {
        console.error(failedToProcessRejectRequestError(), err);
        return Promise.reject(failedToProcessRejectRequestError())
    } 
})

module.exports = {
    rejectRequestHandler,
    handler: rejectRequestHandler(rejectRequest, parseToken, convertSubToUid)
}