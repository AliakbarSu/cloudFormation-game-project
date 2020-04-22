const { curry, get, getOr } = require('lodash/fp')
const { processResult } = require('./processResult')


const failedToProcessResultsError = () => new Error("FAILED_TO_PROCESS_RESULTS")

const handlerSafe = curry(async (processResult, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const records = get("Records", event)
    const mapedRecords = records.map(record => getOr(null, "messageAttributes.gameId.stringValue", record))
    const filteredRecords = mapedRecords.filter(record => record)
    if(filteredRecords.length === 0)
        return Promise.resolve("NO_RESULTS_TO_CALCULATE")

   
    const processedRecords = await Promise.all(
        filteredRecords.map(r => processResult(r).catch(e => e))
    )
    
    const passedRecords = processedRecords.filter(result => !(result instanceof Error))
    const failedRecords = processedRecords.filter(result => (result instanceof Error))

    if(passedRecords.length === 0)
        return Promise.reject(failedToProcessResultsError())

    return Promise.resolve(failedRecords)
})




module.exports = {
    failedToProcessResultsError,
    handlerSafe,
    handler: handlerSafe(processResult)
}