let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const STITCH = require('./stitch')
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
              responseData = await STITCH.createStitchApp(event)
              eventCopy = {...event, PhysicalResourceId: responseData._id}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            case "UPDATE":
              responseData = await STITCH.updateStitchApp(event)
              eventCopy = {...event, PhysicalResourceId: responseData._id}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            case "DELETE":
              responseData = await STITCH.deleteStitchApp(event)
              eventCopy = {...event, PhysicalResourceId: responseData._id}
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