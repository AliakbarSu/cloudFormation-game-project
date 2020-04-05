let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}

const GameModel = require(resourcesPath + "models/game.model.js")
const QuestionModel = require(resourcesPath + "models/questions.model")
const RequestModel = require(`${resourcesPath}models/request.model.js`) 
const AWS = require('aws-sdk')
const uuid = require('uuid')
const db = require(resourcesPath + 'dynamodb.connector')
const CONSTANTS = require(resourcesPath + 'constants')


const processPendingRequests = deps => (event, context) => {

    context.callbackWaitsForEmptyEventLoop = false;

    const records = event.Records.map(r => ({
        requestId: r.messageAttributes.requestId.stringValue
    }));
   
    return Promise.all([
        ...records.map(r => deps.processRequest(r, deps))
    ]).catch(err => {
        console.log("Could not process the pending request", err)
        throw err
    })
}


const processRequest = async (request, deps) => {
    try {
        const requestModelObj = new deps.RequestModel({...deps})
        const results = await requestModelObj.getPendingRequest(request);
        const requestData = results.Items[0];
        if(results.Count > 0) {
            const playersObjKeys = Object.keys(requestData.players)
            const playersArray = playersObjKeys.map(key => ({...requestData.players[key]}))
            const readyPlayers = playersArray.filter(p => p.accepted == true);
            if(readyPlayers.length > 0) {
                const gameModelObj = new deps.GameModel({...deps})
                return gameModelObj.createGame(
                    request.requestId, 
                    requestData.players,
                    {
                        level: requestData.level,
                        subject: requestData.category,
                        language: requestData.language,
                        limit: 5
                    }
                )
            }else {
                // cancel request and notify user
                console.log(`for request with ID ${request}, no player accepted the request`)
                return;
            }
        }else {
            return Promise.resolve("Nothing found")
        } 
    }catch(err) {
        err.requestId = request.requestId
        throw err;
    }
}

module.exports = {
    handler: processPendingRequests({
        RequestModel,
        QuestionModel,
        GameModel,
        processRequest,
        AWS,
        CONSTANTS,
        getId: uuid.v4,
        DynamodbConnector: db
    }),
    processRequest,
    processPendingRequests
}

