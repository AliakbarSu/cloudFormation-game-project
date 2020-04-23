let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"
const { curry, get } = require('lodash/fp')
const {
    isValidConnectionId,
    isValidGameId,
    isValidQuestionId,
    isValidAnswerIds
} = require(layerPath + 'utils/validators/index')
const {
    invalidConnectionIdError,
    invalidGameIdError,
    invalidQuestionIdError,
    invalidAnswerIdError,
    invalidAnswerIdsError
} = require(layerPath + 'utils/errors/general')
const { findUserByConId } = require(layerPath + 'models/players.model')
const { submitAnswer } = require(layerPath + 'models/game.model')


const failedToSubmitAnswersError = () => new Error("FAILED_TO_SUBMIT_ANSWERS")

const handlerSafe = curry(async (findUserByConId, submitAnswers, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;                                                                                                                                                              

    const connectionId = get("connectionId", event)
    const gameId = get("gameId", event)
    const questionId = get("questionId", event)
    const answerIds = get("answerIds", event)

    if(!isValidConnectionId(connectionId))
        return Promise.reject(invalidConnectionIdError())

    if(!isValidGameId(gameId))
        return Promise.reject(invalidGameIdError())

    if(!isValidQuestionId(questionId))
        return Promise.reject(invalidQuestionIdError())

    if(answerIds && answerIds.length === 0)
        return Promise.reject(invalidAnswerIdError())

    if(!isValidAnswerIds(answerIds))
        return Promise.reject(invalidAnswerIdsError())

    try {
        const playerId = await findUserByConId(connectionId)
        await submitAnswers(gameId, playerId, questionId, answerIds)
        return Promise.resolve("ANSWERS_SUBMITTED_SUCCESSFULLY")
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToSubmitAnswersError())
    }
})

module.exports = {
    failedToSubmitAnswersError,
    handlerSafe,
    handler: handlerSafe(
        findUserByConId(process.env.MONGO_DB_URI), 
        submitAnswer(process.env.DYNAMODB_GAMES_TABLE))
}