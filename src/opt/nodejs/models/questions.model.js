
class QuestionsModel {
    constructor(connector, uuid) {
        this.uuid = uuid
        this._connector = connector.connector()
    }

    get connector() {
        return this._connector
    }


    async generateQuize(filters) {
        if(!filters || !filters.level || !filters.subject || !filters.language) {
            return Promise.reject(new Error("INVALID_QUESTION_FILTERS"))
        }
        const queryParams = {
            TableName: process.env.DYNAMODB_QUESTIONS_TABLE,
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

module.exports = () => {
    const bottle = require('bottlejs').pop("click")
    bottle.service("model.questions", QuestionsModel, "connector.dynamodb", "lib.uuid")
} 