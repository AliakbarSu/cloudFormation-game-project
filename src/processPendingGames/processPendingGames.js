let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}

const bottle = require(resourcesPath + "container")
const processGame = require('./processGame')
bottle.service("processGame", processGame, "model.player", "model.game", "connector.apigateway", "connector.sqs")
bottle.service("processPendingGames", processPendingGames, "lib.aws", "processGame")

const processPendingGames = (aws, processGame) => async (event, context) => {

    context.callbackWaitsForEmptyEventLoop = false;

    const records = event.Records.map(r => {
        const data = aws.DynamoDB.Converter.unmarshall(r.dynamodb.NewImage)
        return {
            gameId: r.dynamodb.Keys._id.S,
            eventName: r.eventName,
            questions: data.questions,
            players: data.players,
            requestId: data.request_id
        }
    }).filter(r => r.eventName == "INSERT");
   
    return Promise.all([
        ...records.map(record => processGame(record, deps))
    ]).catch(err => {
        console.log(err)
        throw err
    })
   
}




module.exports = bottle.container.processPendingGames

