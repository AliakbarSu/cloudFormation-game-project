'use strict';

const aws = require('./commonModules').AWS
const CONSTANTS = require('./constants');

// if(process.env['DEV']) {
//     var creds = new aws.FileSystemCredentials('../../credentials.json');
  
//     new aws.Config({
//         credentials: creds
//     })
// }

class DynamoDbConnector {
    constructor(deps) {
        this.deps = deps
        const db_region = deps.region != null ? deps.region : 'us-east-1'
        this._connector = new deps.AWS.DynamoDB.DocumentClient({region: db_region});
    }

    connector() {
        return this._connector;
    }
}

module.exports = DynamoDbConnector


