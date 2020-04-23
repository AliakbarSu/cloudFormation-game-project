let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get } = require("lodash/fp")
const { registerConnectionId } = require(layerPath + "models/players.model")
const {
    isValidConnectionId,
    isValidEmail
} = require(layerPath + "utils/validators/index")
const {
    invalidConnectionIdError,
    invalidEmail
} = require(layerPath + "utils/errors/general")



const handlerSafe = curry(async (registerConnectionId, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false
    
    const connectionId = get("connectionId", event)
    const connectionType = get("connectionType", event)
    const userEmail = get("userEmail", event)

    if(!isValidConnectionId(connectionId))
        return Promise.reject(invalidConnectionIdError())
    
    if(!isValidEmail(userEmail)) 
        return Promise.reject(invalidEmail())

    return registerConnectionId(connectionId, userEmail)
})


module.exports = {
    handlerSafe,
    handler: handlerSafe(registerConnectionId(process.env.MONGODB_URI))
}