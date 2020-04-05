'use strict';

const aws = require('aws-sdk');
const CONSTANTS = require('./constants');
const PlayersModel = require('./models/players')

aws.config.update({region: CONSTANTS.API_GATEWAY_REGION})

class ApiGatewayConnector {
    constructor(deps) {
        this.deps = deps
        const CONNECTOR_OPTS = {
            endpoint: this.deps.CONSTANTS.WEBSOCKET_API_ENDPOINT
        };
        this._connector = new this.deps.AWS.ApiGatewayManagementApi(CONNECTOR_OPTS);
    }

    get connector() {
        return this._connector;
    }

    async generateSocketMessage(connectionId, data) {
        if(!connectionId || !data) {
            return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
        }
        try {
            const result = await this._connector.postToConnection({
                ConnectionId: connectionId,
                Data: data
            }).promise();
            return result
        } catch (error) {
            console.error('Unable to generate socket message', error);
            if (error.statusCode === 410) {
                console.log(`Removing stale connector ${connectionId}`);
                await this.deps.PlayersModel.deregisterConnectionId(connectionId)
            }
        }
    }

    broadcastMessage(connectionIds, data) {
        if(!connectionIds || connectionIds.length == 0 || !data) {
            return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
        }
        const promises = [];
        connectionIds.forEach(conId => {
            promises.push(this.generateSocketMessage(conId, data))
        });
        return Promise.all(promises)
    }
}

module.exports = ApiGatewayConnector
