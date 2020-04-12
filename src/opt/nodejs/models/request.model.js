

class RequestModel {
    constructor(connector, uuid) {
        console.log(connector, uuid)
        this.uuid = uuid
        this._connector = connector.connector()
    }

    get connector() {
        return this._connector
    }


    addRequest(players) {
        if(!players || players.length == 0) {
            return Promise.reject(new Error("INVALID_PLAYERS_DATA"))
        }
        const currentTime = new Date().getTime();
        const RequestId = this.uuid.v4()
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
            TableName: process.env.DYNAMODB_REQUESTS_TABLE,
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
            TableName: process.env.DYNAMODB_REQUESTS_TABLE,
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
            TableName: process.env.DYNAMODB_REQUESTS_TABLE,
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
module.exports = () => {
    const bottle = require('bottlejs').pop("click")
    bottle.service("model.request", RequestModel, "connector.dynamodb", "lib.uuid")
} 