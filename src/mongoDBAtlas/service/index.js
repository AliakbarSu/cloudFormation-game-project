let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const SERVICE = require('./service')
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

        console.log("Received Event: " + event.RequestType)
        switch(event.RequestType.toUpperCase()) {
            case "CREATE":
              responseData = await SERVICE.createService(event)
              eventCopy = {...event, PhysicalResourceId: responseData._id}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            case "UPDATE":
              responseData = await SERVICE.updateService(event)
              return SR.sendResponse(event, context, responseStatus, responseData)
            case "DELETE":
              responseData = await SERVICE.deleteService(event)
              return SR.sendResponse(event, context, responseStatus, responseData)
            default:
              console.log("Invalid RequestType", event.RequestType)
              return SR.sendResponse(event, context, "FAILED", responseData)
        }
    }catch(err) {
        console.log(`Failed to perform ${event.RequestType} operation ${err}`)
        return SR.sendResponse(event, context, "FAILED", responseData)
    }
}