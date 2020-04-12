
class GameModel {
    constructor(connector, questionsModel, uuid) {
        this.questionsModel = questionsModel
        this.uuid = uuid
        this._connector = connector.connector()
    }

    get connector() {
        return this._connector
    }


    async createGame(requestId, players, gameFilters) {
        if(!requestId || !players || !gameFilters) {
            return Promise.reject(new Error("REQUIRED_DATA_IS_MISSING"))
        }
        const currentTime = new Date().getTime();
        const questions = await this.questionsModel.generateQuize({
            level: gameFilters.level,
            subject: gameFilters.subject, 
            language: gameFilters.language, 
            limit: gameFilters.limit
        })
        if(questions.length == 0) {
            return Promise.reject(new Error("NO_QUESTION_FOUND"))
        }
        const questionsObj = {};
        questions.forEach(quest => {
            questionsObj[quest._id] = {
                ...quest
            }
        })
        const socketParams = {
            TableName: process.env.DYNAMODB_GAMES_TABLE,
            Item: {
                _id: this.uuid.v4(),
                request_id: requestId,
                players: players,
                questions: questionsObj,
                created_at: currentTime,
                updated_at: currentTime,
                active: true
            }
        };
        return this._connector.put(socketParams).promise();
    }

    getPendingGame(game) {
        if(!game || !game.gameId) {
            return Promise.reject(new Error("GAME_ID_IS_INVALID"))
        }
        const queryParams = {
            TableName: process.env.DYNAMODB_GAMES_TABLE,
            KeyConditionExpression: '#gameId = :id',
            FilterExpression: 'active = :active',
            ExpressionAttributeNames: {
                '#gameId': '_id',
            },
            ExpressionAttributeValues: {
                ':id': game.gameId,
                ':active': true
            }
        };

        return this._connector.query(queryParams).promise();
    }

    markQuestionAsFetched(qid) {
        if(!qid) {
            return Promise.reject(new Error("INVALID_QUESTION_ID"))
        }
        const queryParams = {
            TableName: process.env.DYNAMODB_GAMES_TABLE,
            Key:{
                "_id": qid
            },
            UpdateExpression: "set questions[0].fetched = :acceptedValue",
            ExpressionAttributeValues: {
                ":acceptedValue": true,
            }
        };

        return this._connector.update(queryParams).promise();
    }
}


module.exports = () => {
    const bottle = require('bottlejs').pop("click")
    bottle.service("model.game", GameModel, "connector.dynamodb", "model.questions", "lib.uuid")
}