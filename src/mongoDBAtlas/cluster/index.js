let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const CLUSTER = require('./cluster')
const CLUSTER_STATE = require('./clusterState')
const SR = require(resourcesPath + 'utils/sendResponse')
const TO = require(resourcesPath + 'utils/timeout')

exports.handler = async (event, context) => {

    let eventCopy = {}
    let clusterName = null;
    let responseStatus = "SUCCESS"
    let responseData = {}

    try {

        event = {...event, ...event.ResourceProperties}

        const timeoutValue = context.getRemainingTimeInMillis()
        TO.timeout(event, context, timeoutValue)

        switch(event.RequestType.toUpperCase()) {
            case "CREATE":
              await CLUSTER.createCluster(event)
              responseData = await CLUSTER_STATE.checkClusterStatus(event, 180000, 5)
              eventCopy = {...event, PhysicalResourceId: responseData.name}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            case "UPDATE":
              await CLUSTER.updateCluster(event)
              responseData = await CLUSTER_STATE.checkClusterStatus(event, 180000, 5)
              eventCopy = {...event, PhysicalResourceId: responseData.name}
              return SR.sendResponse(eventCopy, context, responseStatus, responseData)
            case "DELETE":
              await CLUSTER.deleteCluster(event)
              responseData = await CLUSTER_STATE.checkClusterStatus(event, 180000, 5)
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







    
      