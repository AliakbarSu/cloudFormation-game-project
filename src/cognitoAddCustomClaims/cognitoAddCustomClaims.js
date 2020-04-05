let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const PlayersModel = require(resourcesPath + "models/players.js")


const handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const userEmail = event.request.userAttributes.email

    if(!userEmail) {
        return new Error("Invalid parameters")
    }
    const user = await PlayersModel.findUserByEmail(userEmail);
    event.response.claimsOverrideDetails = { 
        claimsToAddOrOverride: { 
            uid: user._id
        }
    } 
    return event;
}

exports.handler = handler


