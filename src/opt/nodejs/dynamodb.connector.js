'use strict';


class DynamoDbConnector {
    constructor(aws) {
        this._connector = new aws.DynamoDB.DocumentClient();
    }

    connector() {
        return this._connector;
    }
}

module.exports = () => {
    const bottle = require('bottlejs').pop("click")
    bottle.service("connector.dynamodb", DynamoDbConnector, "lib.aws")
}

