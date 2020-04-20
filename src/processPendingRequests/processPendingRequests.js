const { curry, get, getOr} = require("lodash/fp")
const { processRequest } = require('./processRequest')

const failedToProcessRequestsError = () => new Error("FAILED_TO_PROCESS_REQUESTS")

const handlerSafe = curry(async (processRequest, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const records = get("Records", event)
    const mapedRecords = records.map(record => getOr(null, "messageAttributes.requestId.stringValue", record))
    const filteredRecords = mapedRecords.filter(record => record)
    console.log(filteredRecords)
    if(filteredRecords.length === 0)
        return Promise.resolve("NO_REQUEST_TO_PROCESS")

   
    const processedRecords = await Promise.all(
        filteredRecords.map(r => processRequest(r).catch(e => e))
    )
    
    const passedRecords = processedRecords.filter(result => !(result instanceof Error))
    const failedRecords = processedRecords.filter(result => (result instanceof Error))

    if(passedRecords.length === 0)
        return Promise.reject(failedToProcessRequestsError())

    return Promise.resolve(failedRecords)
})
 
module.exports = {
    failedToProcessRequestsError,
    handlerSafe,
    handler: handlerSafe(processRequest)
}

