let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get } = require("lodash/fp")
const { broadcastMessages } = require(layerPath + 'connectors/apigateway.connector')
const { getPlayersConIds } = require(layerPath + 'models/players.model')
const { scheduleNextQuestion } = require(layerPath + 'connectors/sqs.connector')
const { markQuestionAsFetched } = require(layerPath + 'models/game.model')


const failedToGetPlayersIdsError = () => new Error("FAILED_TO_GET_PLAYERS_IDS")
const failedToProcessGameError = () => new Error("FAILED_TO_PROCESS_GAME")


const getPlayersIds = curry((parser, playersObj) => {
    try {
        const ids = parser(playersObj)
        return Promise.resolve(ids)
    }catch(err) {
        return Promise.reject(failedToGetPlayersIdsError())
    }
})

const constructNewQuestionObject = curry((gid, question) => {
    return {
        gid,
        question
    }
})

const constructNewMessageObject = curry((message, data) => ({
    message,
    data
}))


const processGameSafe = curry(async (
    getPlayersConIds, 
    broadcastMessages, 
    markQuestionAsFetched, 
    scheduleNextQuestion,
    parser,
    game) => {

    try {
        const gameId = get("gameId", game)
        const questions = get("questions", game)
        const players = get("players", game)

        const playerIds = await getPlayersIds(parser, players)
        const playersConnectionIds = await getPlayersConIds(playerIds)
                
        const questionObj = constructNewQuestionObject(gameId, questions[0])
        const messageObj = constructNewMessageObject("GAME_QUESTION", questionObj)


        const result = await  Promise.all([
            broadcastMessages(playersConnectionIds, messageObj).catch(e => e),
            markQuestionAsFetched(gameId).catch(e => e),
            scheduleNextQuestion(gameId).catch(e => e)
        ])
        
        const failedProcesses = result.filter(result => (result instanceof Error))
        return failedProcesses

    }catch(err) {
        console.log(err)
        return Promise.reject(failedToProcessGameError())
    } 
})

module.exports = {
    failedToGetPlayersIdsError,
    failedToProcessGameError,
    constructNewMessageObject,
    constructNewQuestionObject,
    getPlayersIds,
    processGameSafe,
    processGame: processGameSafe(
        getPlayersConIds(process.env.MONGO_DB_URI), 
        broadcastMessages({ endpoint: process.env.WEBSOCKET_API_ENDPOINT }), 
        markQuestionAsFetched(process.env.DYNAMODB_GAMES_TABLE), 
        scheduleNextQuestion(process.env.SCHEDULED_QUESTIONS_QUE_URL), 
        Object.keys)
}



// const processGame = (playerModel, gameModel, apigatewayConnector, sqsConnector) => async (game) => {
//     try {
//         const playersConIds = await playerModel.getPlayersConIds(Object.keys(game.players));
//         const new_question_message = {
//             gid: game.gameId,
//             question: game.questions[0]
//         }

//         return Promise.all([
//             apigatewayConnector.broadcastMessage(playersConIds, {message: "GAME_QUESTION", data: new_question_message}),
//             gameModel.markQuestionAsFetched(new_question_message.gid),
//             sqsConnector.scheduleNextQuestion(new_question_message.gid)
//         ]).catch(errArray => {
//             if(errArray[0]) {
//                 if(errArray[0].name == "CONNECTING_TO_PLAYER") {
//                     console.log("Could not send request to one of the clients", errArray)
//                 }
//             }else {
//                 throw errArray
//             }
//         })
       
//     }catch(err) {
//         return Promise.reject(err)
//     }
// }

// module.exports = processGame