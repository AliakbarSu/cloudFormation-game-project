'use strict';
const aws = require('aws-sdk')

const dynamodbConnector = (connector) => connector

module.exports = {
    dynamodbConnector,
    getConnector: options => dynamodbConnector(new aws.DynamoDB.DocumentClient(options))
}

