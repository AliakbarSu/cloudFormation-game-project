let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get } = require("lodash/fp")
const { deregisterConnectionId } = require(layerPath + "models/players.model")
const { isValidConnectionId } = require(layerPath + "utils/validators/index")
const { invalidConnectionIdError } = require(layerPath + "utils/errors/general")


const handlerSafe = curry(async (deregisterConnectionId, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    const connectionId = get("connectionId", event)
    const connectionType = get("connectionType", event)

    if(!isValidConnectionId(connectionId))
        return Promise.reject(invalidConnectionIdError)

    return deregisterConnectionId(connectionId);
})

module.exports = {
    handlerSafe,
    handler: handlerSafe(deregisterConnectionId())
}