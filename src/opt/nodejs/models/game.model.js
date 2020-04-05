const db = require('../dynamodb.connector');
const CONSTANTS = require("../constants")
const uuid = require("uuid")
const questionsModel = require('./questions.model')


class GameModel {
    constructor(deps) {
        this.deps = deps;
        const dynamodb = new this.deps.DynamodbConnector({...deps, region: 'us-east-2'})
        this._connector = dynamodb.connector()
    }

    get connector() {
        return this._connector
    }


    async createGame(requestId, players, gameFilters) {
        if(!requestId || !players || !gameFilters) {
            return Promise.reject(new Error("REQUIRED_DATA_IS_MISSING"))
        }
        const currentTime = new Date().getTime();
        const questionsModelObj = new this.deps.QuestionModel({...this.deps})
        const questions = await questionsModelObj.generateQuize({
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
            TableName: this.deps.CONSTANTS.DYNAMODB_GAMES_TABLE,
            Item: {
                _id: this.deps.getId(),
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
            TableName: this.deps.CONSTANTS.DYNAMODB_GAMES_TABLE,
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
            TableName: this.deps.CONSTANTS.DYNAMODB_GAMES_TABLE,
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


module.exports = GameModel