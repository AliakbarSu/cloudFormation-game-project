let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const COLLECTION = require('./collection')
const SR = require(resourcesPath + 'utils/sendResponse')
const TO = require(resourcesPath + 'utils/timeout')

exports.handler = async (event, context) => {
    let eventCopy = {}
    let responseStatus = "SUCCESS"
    let responseData = {}

    try {

        event = {...event, ...event.ResourceProperties}

        const timeoutValue = context.getRemainingTimeInMillis()
        TO.timeout(event, context, timeoutValue)

        switch(event.RequestType.toUpperCase()) {
            case "CREATE":
              responseData = await COLLECTION.createCollection(event)
              eventCopy = {...event, PhysicalResourceId: responseData.name}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            case "UPDATE":
              responseData = await COLLECTION.updateCollection(event)
              eventCopy = {...event, PhysicalResourceId: responseData.name}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            case "DELETE":
              responseData = await COLLECTION.deleteCollection(event)
              eventCopy = {...event, PhysicalResourceId: responseData.name}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            default:
              console.log("Invalid RequestType", event.RequestType)
              responseStatus = "FAILED"
              return SR.sendResponse(event, context, responseStatus, responseData)
        }
    }catch(err) {
        console.log(`Failed to perform ${event.RequestType} operation ${err}`)
        return SR.sendResponse(event, context, "FAILED", responseData)
    }
}