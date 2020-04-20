let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get} = require("lodash/fp")
const { isValidRequestId } = require(layerPath + 'utils/validators/index')
const { invalidRequestIdError } = require(layerPath + 'utils/errors/general')
const { processGame } = require('./processGame')
const AWS = require('aws-sdk')

const invalidPlayersError = () => new Error("INVALID_PLAYERS_IN_REQUEST_OBJECT")
const invalidQuestionsError = () => new Error("INVALID_QUESTIONS_IN_REQUEST_OBJECT")
const failedToProcessRecordsError = () => new Error("FAILED_TO_PROCESS_RECORDS")
const failedToUnmarshallDataError = () => new Error("FAILED_TO_UNMARSHALL_DATA")

const unmarshallData = curry(async (unmarshall, record, gameId) => {
    try {
        const data = unmarshall(record)
        const players = get("players", data)
        const questions = get("questions", data)
        const requestId = get("request_id", data)
        if(players.length < 2)
            return Promise.reject(invalidPlayersError())

        if(questions.length == 0)
            return Promise.reject(invalidQuestionsError())

        if(!isValidRequestId(requestId))
            return Promise.reject(invalidRequestIdError())

        return Promise.resolve({
            gameId,
            questions,
            players,
            requestId
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToUnmarshallDataError())
    }
    
})


const handlerSafe = curry(async (unmarshall, processGame, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const records = get("Records", event)
    const filteredRecords = records.filter(record => record.eventName == "INSERT")

    if(filteredRecords.length == 0)
        return Promise.resolve("NO_RECORD_TO_PROCESS")

    const mapedRecords = await Promise.all(
        filteredRecords.map(record => 
            unmarshallData(
                unmarshall, 
                record.dynamodb.NewImage,
                record.dynamodb.Keys._id.S
            ).catch(e => e))
        )

    const validResults = mapedRecords.filter(result => !(result instanceof Error))
    const invalidResults = mapedRecords.filter(result => (result instanceof Error))

    if(validResults.length == 0)
        return Promise.reject(invalidResults[0])

    const processedGames = await Promise.all(validResults.map(record => processGame(record).catch(e => e)))
    const passedProcesses = processedGames.filter(result => !(result instanceof Error))
    const failedProcesses = processedGames.filter(result => (result instanceof Error))

    if(passedProcesses.length == 0)
        return Promise.reject(failedProcesses[0])
    
    return Promise.resolve(passedProcesses)
})

module.exports = {
    invalidPlayersError,
    invalidQuestionsError,
    failedToProcessRecordsError,
    failedToUnmarshallDataError,
    unmarshallData,
    handlerSafe,
    handler: handlerSafe(AWS.DynamoDB.Converter.unmarshall, processGame)
}


