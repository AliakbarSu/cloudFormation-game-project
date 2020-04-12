const { curry } = require("lodash")
const { convertSubToUid } = require("../opt/nodejs/utils/auth/convert-to-sub")
const { isValidSub } = require('../opt/nodejs/utils/validators/index')


const handler = curry((requestModel, parseToken, convertSubToUid, event, context) => {

    context.callbackWaitsForEmptyEventLoop = false

    if(!event.token || !event.requestId) {
        return Promise.reject(new Error("INVALID_PARAMETERS_PROVIDED"))
    }

    const token = event.token
    const requestId = event.requestId

    try {
        const claims = await parseToken(token)
        const pid = convertSubToUid(claims.sub);
        const request = await requestModel.acceptRequest(requestId, pid)
        return request
    }catch(err) {
        console.error(err);
        return Promise.reject(new Error("FAILED_TO_PROCESS_REQUEST"))
    } 
})

module.exports = {
    handler: handler("requestModel", "parseToken", convertSubToUid(isValidSub))
}