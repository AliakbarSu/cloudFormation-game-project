let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get, getOr } = require("lodash/fp")
const { 
    isValidLongitude,
    isValidCategory,
    isValidLanguage,
    isValidLevel,
    isValidPid,
    isValidConnectionId,
    isValidNumber,
    isValidUrl,
    isValidLatitude
} = require(layerPath + 'utils/validators/index')
const { 
    invalidLatitudeError,
    invalidLongitudeError,
    invalidCategoryError,
    invalidLanguageError,
    invalidLevelError,
    invalidPidError,
    invalidConnectionIdError,
    invalidUrlError
} = require(layerPath + 'utils/errors/general')

const { searchForPlayers, markPlayersAsPlaying } = require(layerPath + 'models/players.model')
const { addRequest } = require(layerPath + 'models/request.model')
const { broadcastMessages } = require(layerPath + 'connectors/apigateway.connector')
const { addRequestSqs } = require(layerPath + 'connectors/sqs.connector')


const invalidCoordinatesError = () => new Error("USER_DATA_CONTAINS_INVALID_COORDINATES")
const failedToGetMaxDistanceError = () => new Error("FAILED_TO_GET_MAX_DISTANCE_ENV_VARIABLE")
const failedToParseDataError = () => new Error("FAILED_TO_PARSE_DATA")
const failedToPerformMatchPlayersOperationError = () => new Error("FAILED_TO_COMPLETE_MATCH_PLAYERS")

const constructBroadcastMessage = curry((parser, message, data) => {
    try {
        const parsedData = parser({message, data})
        return Promise.resolve(parsedData)
    }catch(err) {
        return Promise.reject(failedToParseDataError())
    }
})

const handlerSafe = curry(async (
    searchForPlayers, 
    broadcastMessages, 
    markPlayersAsPlaying, 
    addRequest, 
    addRequestSqs,
    parser,
    maxDistance,
    SQS_REQUEST_QUE_URL,
    event,
    context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const coordinates = get("detail.fullDocument.location.coordinates", event)

    if(coordinates.length < 2)
        return Promise.reject(invalidCoordinatesError())

    const latitude = coordinates[0]
    const longitude = coordinates[1]
    const connectionId = get("detail.fullDocument.connectionId", event)
    const pid = get("detail.fullDocument._id", event)
    const category = get("detail.fullDocument.category", event)
    const language = get("detail.fullDocument.language", event)
    const level = get("detail.fullDocument.level", event)

    if(!isValidLatitude(latitude))
        return Promise.reject(invalidLatitudeError())

    if(!isValidLongitude(longitude))
        return Promise.reject(invalidLongitudeError())

    if(!isValidCategory(category))
        return Promise.reject(invalidCategoryError())
    
    if(!isValidLanguage(language))
        return Promise.reject(invalidLanguageError())
    
    if(!isValidLevel(level))
        return Promise.reject(invalidLevelError())

    if(!isValidPid(pid))
        return Promise.reject(invalidPidError())

    if(!isValidConnectionId(connectionId))
        return Promise.reject(invalidConnectionIdError())
    
    if(!isValidNumber(maxDistance))
        return Promise.reject(failedToGetMaxDistanceError())

    if(!isValidUrl(SQS_REQUEST_QUE_URL))
        return Promise.reject(invalidUrlError())
    
    try {
        const foundPlayers = await searchForPlayers(pid, latitude, longitude, language, category, level, maxDistance)
        if(foundPlayers.length > 0) {
            const connectionIds = [connectionId, ...foundPlayers.map(doc => doc.connectionId)]
            const playerIds = [pid, ...foundPlayers.map(doc => doc._id)]
            const messageToBroadcast = await constructBroadcastMessage(parser, "TEST_REQUEST", "TEST_DATA")
            await broadcastMessages(connectionIds, messageToBroadcast)
            await markPlayersAsPlaying(playerIds)
            const addedRequest = await addRequest(foundPlayers.map(p => ({...p, pid: p._id})))
            await addRequestSqs(SQS_REQUEST_QUE_URL, addedRequest, playerIds)
            return Promise.resolve("NEW_REQUEST_ADDED")
        }
        return null
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToPerformMatchPlayersOperationError())
    }
})


module.exports = {
    invalidCoordinatesError,
    failedToGetMaxDistanceError,
    failedToParseDataError,
    failedToPerformMatchPlayersOperationError,
    constructBroadcastMessage,
    handlerSafe,
    handler: handlerSafe(
        searchForPlayers(),
        broadcastMessages(),
        markPlayersAsPlaying(),
        addRequest,
        addRequestSqs,
        JSON.parse,
        process.env.MAX_DISTANCE,
        process.env.SQS_REQUEST_QUE_URL
    )
}


// function matchPlayers (playersModel, requestModel, apigatewayConnector, sqsConnector) {
//     return async (event, context) => {
//         context.callbackWaitsForEmptyEventLoop = false;
//         const userData = {...event.detail.fullDocument, location: {}};
//         userData.location.long = event.detail.fullDocument.location.coordinates[0]
//         userData.location.lat = event.detail.fullDocument.location.coordinates[1]
    
//         const foundPlayers = await playersModel.searchForPlayers(data)
    
//         if(foundPlayers.length > 0) {
//             const connectionIds = [data.connectionId, ...foundPlayers.map(doc => doc.connectionId)]
          
//             const request = {
//                 message: "REQUEST",
//                 data: "TEST REQUEST"
//             }
//             const players = [
//                 {
//                     pid: data._id,
//                     connectionId: data.connectionId
//                 },
//                 ...foundPlayers.map(p => {
//                     return {
//                         pid: p._id,
//                         connectionId: p.connectionId
//                     }
//                 })
//             ]
            
//             await Promise.all([
//                 await apigatewayConnector.broadcastMessage(connectionIds, JSON.stringify(request)),
//                 await playersModel.markPlayersAsPlaying([data._id, ...foundPlayers.map(doc => doc._id)])
//             ]).catch(errArray => {
//                 if(errArray[0]) {
//                     if(errArray[0].name == "CONNECTING_TO_PLAYER") {
//                         console.log("Could not send request to one of the clients", errArray)
//                     }
//                 }else {
//                     throw errArray
//                 }
//             })
    
//             const requestId = await requestModel.addRequest(players)
//             return sqsConnector.addRequest(requestId, [data._id, ...foundPlayers.map(doc => doc._id)], data.level, data.category, data.language)
           
//         }
//         return;      
//     }
// }

// module.exports = bottle.container.matchPlayers