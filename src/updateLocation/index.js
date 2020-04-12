// Bootstraps the application
require(process.env.DEV ? '../opt/nodejs/container' : '/opt/nodejs/container')

const main = bottle => {
    function _handler(playersModel) {
        return async (event, context) => {
            context.callbackWaitsForEmptyEventLoop = false;
        
            const conId = event.connectionId
            const lat = Number(event.data.latitude)
            const long = Number(event.data.longitude)
        
            if(!conId || !lat || !long) {
                return Promise.reject(new Error("SOME_REQUIRED_ARGS_ARE_MISSING"))
            }
        
            try {
                await playersModel.updatePlayersLocation(conId, lat, long)
            }catch(err) {
                console.error("FAILED_TO_UPDATE_PLAYERS_LOCATION", err)
                throw err
            } 
        }
    } 

    bottle.service("updateLocation", _handler, "model.player")
    return bottle.container.updateLocation
}


exports.handler = (...args) => main(require('bottlejs').pop("click"))(...args)