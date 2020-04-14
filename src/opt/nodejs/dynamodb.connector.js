'use strict';


const dynamodbConnector = (connector) => connector

module.exports = {
    dynamodbConnector,
    getConnector: options => dynamodbConnector(new aws.DynamoDB.DocumentClient(options))
}

