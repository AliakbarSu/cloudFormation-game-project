// Bootstraps the application
require(process.env.DEV ? '../opt/nodejs/container' : '/opt/nodejs/container')


const main = bottle => {
    function _handler(playersModel) {
        return async (event, context) => {
            context.callbackWaitsForEmptyEventLoop = false;
        
            if(!event.request.userAttributes.sub || !event.request.userAttributes.email) {
                return Promise.reject(new Error("Missing user attributes. Failed to initalize player"))
            }
            const payload = {
                sub: event.request.userAttributes.sub.substr(0, 12),
                email: event.request.userAttributes.email
            }
        
            try {
                await playersModel.createPlayer(payload)
            }catch(err) {
                console.log("Failed initalizing player. Take action immediately")
                return Promise.reject(err)
            }
            return event
        }
    }

    bottle.service("initializePlayer", _handler, "model.player")
    return bottle.container.initializePlayer
}



exports.handler = (...args) => main(require('bottlejs').pop("click"))(...args)