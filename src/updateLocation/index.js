let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, getOr, get } = require("lodash/fp")
const { updatePlayersLocation } = require(layerPath + 'models/players.model')
const { 
    isValidConnectionId,
    isValidLatitude,
    isValidLongitude
} = require(layerPath + 'utils/validators/index')
const { 
    invalidConnectionIdError,
    invalidLongitudeError,
    invalidLatitudeError
} = require(layerPath + 'utils/errors/general')


const failedToUpdatePlayersLocationError = () => new Error("FAILED_TO_UPDATE_PLAYERS_LOCATION")


const handlerSafe = curry(async (updatePlayersLocation, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
        
    const connectionId = get("connectionId", event)
    const latitude = getOr("1", "data.latitude", event)
    const longitude = getOr("1", "data.longitude", event)

    if(!isValidConnectionId(connectionId))
        return Promise.reject(invalidConnectionIdError())

    if(!isValidLatitude(Number(latitude)))
        return Promise.reject(invalidLatitudeError())
    
    if(!isValidLongitude(Number(longitude)))
        return Promise.reject(invalidLongitudeError())
    
    try {
        await updatePlayersLocation(connectionId, latitude, longitude)
        return Promise.resolve("LOCATION_UPDATED_SECCESSFULLY")
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToUpdatePlayersLocationError())
    } 
})


module.exports = {
    failedToUpdatePlayersLocationError,
    handlerSafe,
    handler: handlerSafe(updatePlayersLocation())
}


