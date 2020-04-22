const { curry, get, getOr } = require('lodash/fp')
const { processQuestion } = require('./processQuestion')


const failedToProcessQuestionError = () => new Error("FAILED_TO_PROCESS_QUESTION")


const handlerSafe = curry(async (processQuestion, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const records = get("Records", event)
    const mapedRecords = records.map(record => getOr(null, "messageAttributes.gameId.stringValue", record))
    const filteredRecords = mapedRecords.filter(record => record)
    if(filteredRecords.length === 0)
        return Promise.resolve("NO_QUESTION_TO_PROCESS")

   
    const processedRecords = await Promise.all(
        filteredRecords.map(r => processQuestion(r).catch(e => e))
    )
    
    const passedRecords = processedRecords.filter(result => !(result instanceof Error))
    const failedRecords = processedRecords.filter(result => (result instanceof Error))

    if(passedRecords.length === 0)
        return Promise.reject(failedToProcessQuestionError())

    return Promise.resolve(failedRecords)
})


module.exports = {
    failedToProcessQuestionError,
    handlerSafe,
    handler: handlerSafe(processQuestion)
}