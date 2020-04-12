let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const bottle = require(resourcesPath + 'container')
const processRequest = require('./processRequest')

bottle.service("processRequest", processRequest, "model.game", "model.request")

bottle.service("processPendingRequests", processPendingRequests, "processRequest")

const processPendingRequests = (processRequest) => (event, context) => {

    context.callbackWaitsForEmptyEventLoop = false;

    const records = event.Records.map(r => ({
        requestId: r.messageAttributes.requestId.stringValue
    }));
   
    return Promise.all([
        ...records.map(r => processRequest(r))
    ]).catch(err => {
        console.log("Could not process the pending request", err)
        throw err
    })
}



module.exports = bottle.container.processPendingRequests

