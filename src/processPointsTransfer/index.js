const { curry, get, getOr} = require("lodash/fp")
const { processTransfer } = require('./processTransfer')

const failedToProcessTransfersError = () => new Error("FAILED_TO_PROCESS_TRANSFERS")

const handlerSafe = curry(async (processTransfer, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const records = get("Records", event)
    const mapedRecords = records.map(record => getOr(null, "messageAttributes", record))
    const filteredRecords = mapedRecords.filter(record => record).map(tr => 
        ({code: get("code.StringValue", tr), amount: get("amount.StringValue", tr), playerId: get("playerId.StringValue", tr)}))

    if(filteredRecords.length === 0)
        return Promise.resolve("NO_TRANSFER_TO_PROCESS")

   
    const processedRecords = await Promise.all(
        filteredRecords.map(r => processTransfer(r).catch(e => e))
    )
    
    const passedRecords = processedRecords.filter(result => !(result instanceof Error))
    const failedRecords = processedRecords.filter(result => (result instanceof Error))

    if(passedRecords.length === 0)
        return Promise.reject(failedToProcessTransfersError())

    return Promise.resolve(failedRecords)
})
 
module.exports = {
    failedToProcessTransfersError,
    handlerSafe,
    handler: handlerSafe(processTransfer)
}

