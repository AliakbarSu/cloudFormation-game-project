const db = require('../dynamodb.connector');
const CONSTANTS = require("../constants")
const uuid = require("uuid")


class QuestionsModel {
    constructor(deps) {
        this.deps = deps
        const dynamodb = new this.deps.DynamodbConnector({CONSTANTS, AWS: deps.AWS, region: 'us-east-2'})
        this._connector = dynamodb.connector()
    }

    get connector() {
        return this._connector
    }


    async generateQuize(filters) {
        if(!filters || !filters.level || !filters.subject || !filters.language) {
            return Promise.reject(new Error("INVALID_QUESTION_FILTERS"))
        }
        const queryParams = {
            TableName: this.deps.CONSTANTS.DYNAMODB_QUESTIONS_TABLE,
            FilterExpression: 'category = :category AND contains(levels, :level) AND #lang = :language',
            ExpressionAttributeNames: {
                // '#requestId': '_id',
                '#lang': 'language'
            },
            ExpressionAttributeValues: {
                ":category": filters.subject,
                ":level": "Grade " + filters.level,
                ":language": filters.language
            }
        };

        const result = await this._connector.scan(queryParams).promise();
        if(result.Count >= filters.limit) {
            return result.Items.slice(0, filters.limit)
        }else {
            return result.Items
        }
    }
}

module.exports = QuestionsModel