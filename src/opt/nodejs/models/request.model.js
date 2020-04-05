const db = require('../dynamodb.connector');
const CONSTANTS = require("../constants")
const uuid = require("uuid")
const AWS = require('aws-sdk')


class RequestModel {
    constructor(deps) {
        this.deps = deps
        const dynamodb = new this.deps.DynamodbConnector({CONSTANTS, AWS: deps.AWS, region: 'us-east-2'})
        this._connector = dynamodb.connector()
    }

    get connector() {
        return this._connector
    }


    addRequest(players) {
        if(!players || players.length == 0) {
            return Promise.reject(new Error("INVALID_PLAYERS_DATA"))
        }
        const currentTime = new Date().getTime();
        const RequestId = this.deps.getId()
        const playersObj = {}
        players.forEach(p => {
            playersObj[p.pid] = {
                pid: p.pid,
                connectionId: p.connectionId,
                accepted: false,
                accepted_at: null
            }
        })
        const requestParams = {
            TableName: this.deps.CONSTANTS.DYNAMODB_REQUESTS_TABLE,
            Item: {
                _id: RequestId,
                players: playersObj,
                level: players[0].level,
                category: players[0].category,
                language: players[0].language,
                created_at: currentTime,
                updated_at: currentTime,
                active: true
            }
        };
        return this._connector.put(requestParams).promise().then(() => RequestId);
    }

    getPendingRequest(request) {
        if(!request || !request.requestId) {
            return Promise.reject(new Error("INVALID_REQUEST_OBJECT"))
        }
        const queryParams = {
            TableName: this.deps.CONSTANTS.DYNAMODB_REQUESTS_TABLE,
            KeyConditionExpression: '#requestId = :id',
            FilterExpression: 'active = :active',
            ExpressionAttributeNames: {
                '#requestId': '_id',
            },
            ExpressionAttributeValues: {
                ':id': request.requestId,
                ':active': true
            }
        };

        return this._connector.query(queryParams).promise();
    }

    acceptRequest(requestId, pid) {
        if(!requestId || !pid || pid.length == 0 || requestId.length == 0) {
            return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID_OR_MISSING"))
        }
        const acceptedAt = new Date().getTime()
        const queryParams = {
            TableName: this.deps.CONSTANTS.DYNAMODB_REQUESTS_TABLE,
            Key:{
                "_id": requestId
            },
            ConditionExpression: 'active = :active AND attribute_exists(players.#playerId.pid)',
            UpdateExpression: "set players.#playerId.accepted = :acceptedValue, players.#playerId.accepted_at = :acceptedAt",
            ExpressionAttributeNames: {
                '#playerId': pid
            },
            ExpressionAttributeValues: {
                ':active': true,
                ":acceptedAt": acceptedAt,
                ":acceptedValue": true,
            }
        };

        return this._connector.update(queryParams).promise();
    }

    rejectRequest(requestId, pid) {
    }
}
module.exports = RequestModel