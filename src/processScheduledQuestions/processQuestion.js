let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"
const { curry, get, getOr } = require('lodash/fp')
const {
    isValidGameId
} = require(layerPath + 'utils/validators/index')
const {
    invalidGameIdError
} = require(layerPath + 'utils/errors/general')
const { getPendingGame } = require(layerPath + 'models/game.model')
const { scheduleNextQuestion, scheduleResult } = require(layerPath + 'connectors/sqs.connector')
const { getPlayersConIds } = require(layerPath + "models/players.model")
const { broadcastMessages } = require(layerPath + 'connectors/apigateway.connector')


const failedToProcessQuestionError = () => new Error("FAILED_TO_PROCESS_QUESTION")
const failedToConvertQuestionsToArrayFormError = () => new Error("FAILED_TO_CONVERT_QUESTIONS_TO_ARRAY_FORM")
const failedToGetQuestionsError = () => new Error("FAILED_TO_GET_QUESTIONS")

const constructNewQuestionObject = curry((message, data) => ({
    message,
    data
}))


const convertQuestionsObjectToArrayForm = curry((converter, questions) => {
    try {
        const keys = converter(questions)
        const result = keys.map(key => ({...questions[key]}))
        return Promise.resolve(result)
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToConvertQuestionsToArrayFormError())
    }
})

const getUnfetchedQuestions = questions => {
    return questions.filter(question => !question.fetched)
}

const getPlayersIds = curry((parser, playersObj) => {
    try {
        const ids = parser(playersObj)
        return Promise.resolve(ids)
    }catch(err) {
        return Promise.reject(failedToGetPlayersIdsError())
    }
})

const processQuestionSafe = curry(async (getGame, scheduleNextQuestion, scheduleResult, converter, broadcastMessages, getPlayersConIds, gameId) => {
    if(!isValidGameId(gameId))
        return Promise.reject(invalidGameIdError())

    try {
        const result = await getGame(gameId)
        const game = getOr([], "Items", result)[0]
        const questions = get("questions", game)
        if(!questions || questions.length === 0)
            return Promise.reject(failedToGetQuestionsError())

        const playerIds = await getPlayersIds(parser, players)
        const playersConnectionIds = await getPlayersConIds(playerIds)

        const questionsArray = await convertQuestionsObjectToArrayForm(converter, questions)
        const remainingQuestions = getUnfetchedQuestions(questionsArray)

        if(remainingQuestions.length == 0) {
            await scheduleResult(gameId)
            return Promise.resolve("RESULT_WAS_SCHEDULED_SUCCESSFULLY")
        } else {
            const data = constructNewQuestionObject("New Question", remainingQuestions[0])
            await broadcastMessages(playersConnectionIds, data)
            await scheduleNextQuestion(gameId)
            return Promise.resolve("NEXT_QUESTION_WAS_SCHEDULED_SUCCESSFULLY")
        } 
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToProcessQuestionError())
    }
})


module.exports = {
    failedToProcessQuestionError,
    failedToConvertQuestionsToArrayFormError,
    failedToGetQuestionsError,
    processQuestionSafe,
    convertQuestionsObjectToArrayForm,
    getUnfetchedQuestions,
    constructNewQuestionObject,
    getPlayersIds,
    processQuestion: processQuestionSafe(
        getPendingGame(process.env.DYNAMODB_GAMES_TABLE), 
        scheduleNextQuestion(process.env.SCHEDULED_QUESTIONS_QUE_URL), 
        scheduleResult(process.env.SCHEDULE_RESULTS_PROCESS_QUE_URL), 
        Object.keys,
        broadcastMessages({ endpoint: process.env.WEBSOCKET_API_ENDPOINT }),
        getPlayersConIds(process.env.MONGO_DB_URI))
}