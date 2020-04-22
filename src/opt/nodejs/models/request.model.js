const { curry, get } = require('lodash/fp')

const { 
    isValidPid,
    isValidCategory,
    isValidConnectionId,
    isValidLanguage,
    isValidLevel,
    isValidRequestId
} = require('../utils/validators/index')

const uuid = require('uuid')
const { getConnector } = require('../connectors/dynamodb.connector')
const { invalidPidError } = require('../utils/errors/general')


const invalidPlayersDataError = () => new Error("INVALID_PLAYERS_DATA")
const invalidRequestIdError = () => new Error("INVALID_REQUEST_ID")
const failedToAddRequestError = () => new Error("FAILED_TO_ADD_REQUEST")
const failedToFetchRequestError = () => new Error("FAILED_TO_FETCH_REQUEST")
const failedToPerformAcceptRequestError = () => new Error("FAILED_TO_SET_PLAYER_ACCEPT_REQUEST_TO_TRUE")
const failedToPerformRejectRequestError = () => new Error("FAILED_TO_SET_PLAYER_ACCEPT_REQUEST_TO_FALSE")


const extractRelaventProperties = players => {
    return {
        category: players[0].category,
        level: players[0].level,
        language: players[0].language
    }
}

const convertPlayersToObjectForm = players => {
    const playersObj = {}
    players.forEach(p => {
        playersObj[p.pid] = {
            pid: p.pid,
            connectionId: p.connectionId,
            accepted: false,
            accepted_at: null
        }
    })
    return playersObj
}

const validatePlayersData = players => {
    const invalid = players.find(player => {
        return !isValidPid(player.pid) ||
        !isValidCategory(player.category) ||
        !isValidLanguage(player.language) ||
        !isValidConnectionId(player.connectionId) ||
        !isValidLevel(player.level)
    })
    console.log(invalid)
    return invalid == null
}


const addRequestSafe = curry((connector, IDGenerator, tableName, currentTime, data) => {
    if(!validatePlayersData(data)) {
        return Promise.reject(invalidPlayersDataError())
    }

    const requestId = IDGenerator()
    const players = convertPlayersToObjectForm(data)
    const relaventProperties = extractRelaventProperties(data) 
    const requestParams = {
        TableName: tableName,
        Item: {
            _id: requestId,
            players: players,
            level: get("level", relaventProperties),
            category: get("category", relaventProperties),
            language: get("language", relaventProperties),
            created_at: currentTime,
            updated_at: currentTime,
            active: true
        }
    }
    return connector.put(requestParams).promise().then(() => requestId)
    .catch(() => Promise.reject(failedToAddRequestError()))
})


const getPendingRequestSafe = curry((connector, tableName, requestId) => {
    if(!isValidRequestId(requestId)) {
        return Promise.reject(invalidRequestIdError())
    }

    const queryParams = {
        TableName: tableName,
        KeyConditionExpression: '#requestId = :id',
        FilterExpression: 'active = :active',
        ExpressionAttributeNames: {
            '#requestId': '_id',
        },
        ExpressionAttributeValues: {
            ':id': requestId,
            ':active': true
        }
    }

    return connector.query(queryParams).promise().then(data => get("Items", data))
    .catch(() => Promise.reject(failedToFetchRequestError()))
})

const acceptRequestSafe = curry((connector, tableName, currentTime, requestId, playerId) => {
    if(!isValidRequestId(requestId)) {
        return Promise.reject(invalidRequestIdError())
    }

    if(!isValidPid(playerId)) {
        return Promise.reject(invalidPidError())
    }

    const queryParams = {
        TableName: tableName,
        Key:{
            "_id": requestId
        },
        ConditionExpression: 'active = :active AND attribute_exists(players.#playerId.pid)',
        UpdateExpression: "set players.#playerId.accepted = :acceptedValue, players.#playerId.accepted_at = :acceptedAt",
        ExpressionAttributeNames: {
            '#playerId': playerId
        },
        ExpressionAttributeValues: {
            ':active': true,
            ":acceptedAt": currentTime,
            ":acceptedValue": true,
        }
    }

    return connector.update(queryParams).promise().then(() => "REQUEST_UPDATED_SUCCESSFULLY")
    .catch(() => Promise.reject(failedToPerformAcceptRequestError()))
})

const rejectRequestSafe = curry((connector, tableName, currentTime, requestId, playerId) => {
    if(!isValidRequestId(requestId)) {
        return Promise.reject(invalidRequestIdError())
    }

    if(!isValidPid(playerId)) {
        return Promise.reject(invalidPidError())
    }

    const queryParams = {
        TableName: tableName,
        Key:{
            "_id": requestId
        },
        ConditionExpression: 'active = :active AND attribute_exists(players.#playerId.pid)',
        UpdateExpression: "set players.#playerId.accepted = :acceptedValue, players.#playerId.accepted_at = :acceptedAt",
        ExpressionAttributeNames: {
            '#playerId': playerId
        },
        ExpressionAttributeValues: {
            ':active': true,
            ":acceptedAt": null,
            ":acceptedValue": false,
        }
    }

    return connector.update(queryParams).promise().then(() => "REQUEST_UPDATED_SUCCESSFULLY")
    .catch(() => Promise.reject(failedToPerformRejectRequestError()))
})



module.exports = {
    acceptRequestSafe,
    failedToPerformAcceptRequestError,
    addRequestSafe,
    getPendingRequestSafe,
    convertPlayersToObjectForm,
    extractRelaventProperties,
    validatePlayersData,
    invalidPlayersDataError,
    failedToAddRequestError,
    invalidRequestIdError,
    failedToFetchRequestError,
    addRequest: addRequestSafe(getConnector, uuid.v4, process.env.DYNAMODB_REQUESTS_TABLE, new Date().getTime()),
    getPendingRequest: getPendingRequestSafe(getConnector, process.env.DYNAMODB_REQUESTS_TABLE),
    acceptRequest: acceptRequestSafe(getConnector, process.env.DYNAMODB_REQUESTS_TABLE, new Date().getTime()),
    rejectRequest: rejectRequestSafe(getConnector, process.env.DYNAMODB_REQUESTS_TABLE, new Date().getTime()),
}

