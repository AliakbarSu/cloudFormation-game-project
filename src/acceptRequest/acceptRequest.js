let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}
const RequestModel = require(`${resourcesPath}models/request.model.js`) 
const utils = require(resourcesPath + "utils/auth.util.js")

const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const token = event.token;
    const requestId = event.requestId;
    if(!token || !requestId) {
        return new Error("Invalid auth token OR Invalid RequestId!")
    }
    return acceptRequest(requestId, token)
}




exports.handler = handler

async function acceptRequest(requestId, token) {
    try {
        const claims = await utils.parseToken(token);
        const pid = utils.convertSubToUid(claims.sub);
        return RequestModel.acceptRequest(requestId, pid);
    }catch(err) {
        console.log(err);
        return new Error("Failed to parse auth token")
    }
}



