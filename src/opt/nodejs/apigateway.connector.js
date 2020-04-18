'use strict';
const { curry, get } = require('lodash/fp')

const {
    isValidConnectionId
} = require('./utils/validators/index')
const {
    invalidConnectionIdError
} = require('./utils/errors/general')


const failedToPostToConnectionError = () => new Error("FAILED_POST_TO_CONNECTION")
const failedToBroadcastMessageError = () => new Error("FAILED_TO_BROADCAST_MESSAGE")
const failedToBroadcastMessagesError = () => new Error("FAILED_TO_BROADCAST_MESSAGES")
const failedToGetPostToConnectionMethodError = () => new Error("FAILED_GET_POST_TO_CONNECTION_METHOD")
const invalidDataToPostError = () => new Error("INVALID_DATA_TO_POST")



const constructPostData = curry((ConnectionId, Data) => ({
    ConnectionId,
    Data
}))


const postToConnection = curry(async (post, connectionId, data) => {
    if(!data)
        return Promise.reject(invalidDataToPostError())

    if(!isValidConnectionId(connectionId))
        return Promise.reject(invalidConnectionIdError())

    const dataObj = constructPostData(connectionId, data)
    try {
        const result = await post(dataObj).promise()
        return Promise.resolve(result)
    }catch(err) {
        console.log(failedToPostToConnectionError())
        return Promise.reject(err)
    }
})

const broadcastMessagesSafe = curry((connector, connectionIds, data) => {
    if(!data)
        return Promise.reject(invalidDataToPostError())
        
    if(connectionIds.length === 0)
        return Promise.reject(invalidConnectionIdError())

    const post  = get("postToConnection", connector)
    if(!post)
        return Promise.reject(failedToGetPostToConnectionMethodError())

    const promises = connectionIds.map(conId => postToConnection(post, conId, data))
    return Promise.all(promises).catch(err => {
        console.log(err)
        return Promise.reject(failedToBroadcastMessagesError())
    })
})

const broadcastMessageSafe = curry((connector, connectionId, data) => {
    if(!data)
        return Promise.reject(invalidDataToPostError())

    const post = get("postToConnection", connector)
    if(!post)
        return Promise.reject(failedToGetPostToConnectionMethodError())

    return postToConnection(post, connectionId, data).catch(err => {
        console.log(err)
        return Promise.reject(failedToBroadcastMessageError())
    })
})


module.exports = {
    invalidDataToPostError,
    failedToBroadcastMessageError,
    failedToBroadcastMessagesError,
    failedToPostToConnectionError,
    failedToGetPostToConnectionMethodError,
    constructPostData,
    postToConnection,
    broadcastMessageSafe,
    broadcastMessagesSafe,
    broadcastMessages: CONNECTOR_OPTS => broadcastMessagesSafe(new aws.ApiGatewayManagementApi(CONNECTOR_OPTS)),
    broadcastMessage: CONNECTOR_OPTS => broadcastMessageSafe(new aws.ApiGatewayManagementApi(CONNECTOR_OPTS))
}



// class ApiGatewayConnector {
//     constructor(playerModel, aws) {
//         aws.config.update({region: process.env.API_GATEWAY_REGION})
//         this.playerModel = playerModel
//         const CONNECTOR_OPTS = {
//             endpoint: process.env.WEBSOCKET_API_ENDPOINT
//         };
//         this._connector = new aws.ApiGatewayManagementApi(CONNECTOR_OPTS);
//     }

//     get connector() {
//         return this._connector;
//     }

//     async generateSocketMessage(connectionId, data) {
//         if(!connectionId || !data) {
//             return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
//         }
//         try {
//             const result = await this._connector.postToConnection({
//                 ConnectionId: connectionId,
//                 Data: data
//             }).promise();
//             return result
//         } catch (error) {
//             console.error('Unable to generate socket message', error);
//             if (error.statusCode === 410) {
//                 console.log(`Removing stale connector ${connectionId}`);
//                 await this.playerModel.deregisterConnectionId(connectionId)
//             }
//         }
//     }

//     broadcastMessage(connectionIds, data) {
//         if(!connectionIds || connectionIds.length == 0 || !data) {
//             return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
//         }
//         const promises = [];
//         connectionIds.forEach(conId => {
//             promises.push(this.generateSocketMessage(conId, data))
//         });
//         return Promise.all(promises)
//     }
// }

// module.exports = () => {
//     const bottle = require('bottlejs').pop("click")
//     bottle.service("connector.apigateway", ApiGatewayConnector, "model.player", "lib.aws")
// } 
