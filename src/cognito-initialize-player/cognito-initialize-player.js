let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const PlayersModel = require(resourcesPath + "models/players.js")


const handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const payload = {
        sub: event.request.userAttributes.sub.substr(0, 12),
        email: event.request.userAttributes.email
    }
    if(!payload.sub || !payload.email) {
        return new Error("Missing user attributes. Failed to initalize player")
    }
    try {
        await PlayersModel.createPlayer(payload)
    }catch(err) {
        console.log("Failed initalizing player. Take action immediately")
    }
    return event
}

exports.handler = handler




