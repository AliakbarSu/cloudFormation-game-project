let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const PlayersModel = require(resourcesPath + "models/players.js")


exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    const connectionId = event.connectionId;
    const connectionType = event.connectionType;
    const userEmail = event.userEmail;

    if(!connectionId || ! userEmail) {
        return new Error("Invalid parameters")
    }
    return PlayersModel.registerConnectionId(connectionId, userEmail);
}