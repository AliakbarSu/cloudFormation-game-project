let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}
const AWS = require("aws-sdk")
const CONSTANTS = require(resourcesPath + 'constants')
const GameModel = require(resourcesPath + "models/game.model.js")
const PlayersModel = require(resourcesPath + "models/players.js")
const SqsConnector = require(resourcesPath + "sqs.connector.js")
const ApiGatewayConnector = require(resourcesPath + "apigateway.connector.js")
const QuestionModel = require(resourcesPath + 'models/questions.model.js')
const db = require(resourcesPath + "dynamodb.connector")


const processPendingGames = deps => async (event, context) => {

    context.callbackWaitsForEmptyEventLoop = false;

    const records = event.Records.map(r => {
        const data = AWS.DynamoDB.Converter.unmarshall(r.dynamodb.NewImage)
        return {
            gameId: r.dynamodb.Keys._id.S,
            eventName: r.eventName,
            questions: data.questions,
            players: data.players,
            requestId: data.request_id
        }
    }).filter(r => r.eventName == "INSERT");
   
    return Promise.all([
        ...records.map(record => deps.processGame(record, deps))
    ]).catch(err => {
        console.log(err)
        throw err
    })
   
}


const processGame = async (game, deps) => {
    try {
        const playersConIds = await deps.PlayersModel.getPlayersConIds(Object.keys(game.players));
        const new_question_message = {
            gid: game.gameId,
            question: game.questions[0]
        }
        const messageBroadcaster = new deps.ApiGatewayConnector({CONSTANTS, PlayersModel: PlayersModel.obj, AWS})
        const sqsModelObj = new deps.SqsConnector({...deps})
        const gameModelObj = new deps.GameModel({...deps})

        return Promise.all([
            messageBroadcaster.broadcastMessage(playersConIds, {message: "GAME_QUESTION", data: new_question_message}),
            gameModelObj.markQuestionAsFetched(new_question_message.gid),
            sqsModelObj.scheduleNextQuestion(new_question_message.gid)
        ]).catch(errArray => {
            if(errArray[0]) {
                if(errArray[0].name == "CONNECTING_TO_PLAYER") {
                    console.log("Could not send request to one of the clients", errArray)
                }
            }else {
                throw errArray
            }
        })
       
    }catch(err) {
        return Promise.reject(err)
    }
}

module.exports = {
    handler: processPendingGames({
        GameModel,
        AWS,
        QuestionModel,
        DynamodbConnector: db,
        PlayersModel: PlayersModel.obj,
        SqsConnector: SqsConnector.sqsConnector,
        ApiGatewayConnector: ApiGatewayConnector,
        processGame
    }),
    processPendingGames,
    processGame
}

