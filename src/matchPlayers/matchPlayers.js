let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}

const PlayersModel = require(resourcesPath + "models/players.js");
const RequestModel = require(resourcesPath + "models/request.model.js") 
const apigatewayConnector = require(resourcesPath + "apigateway.connector.js")
const sqsConnector = require(resourcesPath + "sqs.connector.js");
const CONSTANTS = require(resourcesPath + "constants.js")
const AWS = require('aws-sdk')
const uuid = require('uuid')
const db = require(resourcesPath + 'dynamodb.connector')


const matchPlayers = deps => async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const userData = {...event.detail.fullDocument, location: {}};
    userData.location.long = event.detail.fullDocument.location.coordinates[0]
    userData.location.lat = event.detail.fullDocument.location.coordinates[1]

    return deps.SearchPlayer(userData, deps).catch(err => {
        console.log(err)
        throw err;
    })
    
}

const searchPlayer = async (data, deps) => {

    const foundPlayers = await deps.PlayersModel.searchForPlayers(data)

    if(foundPlayers.length > 0) {
        const connectionIds = [data.connectionId, ...foundPlayers.map(doc => doc.connectionId)]
      
        const request = {
            message: "REQUEST",
            data: "TEST REQUEST"
        }
        const players = [
            {
                pid: data._id,
                connectionId: data.connectionId
            },
            ...foundPlayers.map(p => {
                return {
                    pid: p._id,
                    connectionId: p.connectionId
                }
            })
        ]
        const connector = new deps.ApigatewayConnector({
            CONSTANTS: deps.CONSTANTS,
            AWS: deps.AWS,
            PlayersModel: PlayersModel.obj
        })
        await Promise.all([
            await connector.broadcastMessage(connectionIds, JSON.stringify(request)),
            await deps.PlayersModel.markPlayersAsPlaying([data._id, ...foundPlayers.map(doc => doc._id)])
        ]).catch(errArray => {
            if(errArray[0]) {
                if(errArray[0].name == "CONNECTING_TO_PLAYER") {
                    console.log("Could not send request to one of the clients", errArray)
                }
            }else {
                throw errArray
            }
        })

        const requestModelObj = new deps.RequestModel({
            AWS: deps.AWS,
            DynamodbConnector: deps.db, 
            CONSTANTS: deps.CONSTANTS, 
            getId: deps.getId
        })
        const requestId = await requestModelObj.addRequest(players)
        const SqsConnectorObj = new deps.SqsConnector({AWS, CONSTANTS: deps.CONSTANTS})
        return SqsConnectorObj.addRequest(requestId, [data._id, ...foundPlayers.map(doc => doc._id)], data.level, data.category, data.language)
       
    }
    return;  
}


module.exports = {
    handler: matchPlayers({
        AWS,
        PlayersModel: PlayersModel.obj,
        RequestModel,
        ApigatewayConnector: apigatewayConnector,
        SqsConnector: sqsConnector,
        CONSTANTS,
        SearchPlayer: searchPlayer,
        db,
        getId: uuid.v4
    }),
    matchPlayers,
    searchPlayer
}