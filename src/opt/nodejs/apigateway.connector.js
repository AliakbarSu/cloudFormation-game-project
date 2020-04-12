'use strict';



class ApiGatewayConnector {
    constructor(playerModel, aws) {
        aws.config.update({region: process.env.API_GATEWAY_REGION})
        this.playerModel = playerModel
        const CONNECTOR_OPTS = {
            endpoint: process.env.WEBSOCKET_API_ENDPOINT
        };
        this._connector = new aws.ApiGatewayManagementApi(CONNECTOR_OPTS);
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
                await this.playerModel.deregisterConnectionId(connectionId)
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

module.exports = () => {
    const bottle = require('bottlejs').pop("click")
    bottle.service("connector.apigateway", ApiGatewayConnector, "model.player", "lib.aws")
} 
