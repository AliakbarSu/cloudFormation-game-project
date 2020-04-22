const { curry, get } = require('lodash/fp')
const { getConnector } = require('../connectors/dynamodb.connector')
const { generateQuize } = require('./questions.model')
const uuid = require('uuid')
const {
    isValidTableName,
    isValidQuestionId,
    isValidGameId,
    isValidRequestId,
    isValidPlayerIds,
    isValidCategory,
    isValidLanguage,
    isValidLevel,
    isValidLimit,
    isValidPid,
    isValidAnswerId,
    isValidAnswerIds
} = require('../utils/validators/index')
const {
    invalidTableNameError,
    invalidQuestionIdError,
    invalidGameIdError,
    invalidRequestIdError,
    invalidPlayerIdsError,
    invalidPidError,
    invalidAnswerIdError,
    invalidAnswerIdsError
} = require('../utils/errors/general')


const failedToGetUpdateMethodError = () => new Error("FAILED_TO_GET_UPDATE_METHOD")
const failedToGetPutMethodError = () => new Error("FAILED_TO_GET_PUT_METHOD")
const failedToGetQueryMethodError = () => new Error("FAILED_TO_GET_QUERY_METHOD")
const failedToMarkQuestionAsFetchedError = () => new Error("FAILED_TO_MARK_QUESTION_AS_FETCHED")
const failedToGetPendingGameError = () => new Error("FAILED_TO_GET_PENDING_GAME")
const failedToGetQuestionsError = () => new Error("FAILED_TO_GET_QUESTIONS")
const failedToGetCurrentTimeError = () => new Error("FAILED_TO_GET_CURRENT_TIME")
const failedToGenerateIdError = () => new Error("FAILED_TO_GENERATE_ID")
const failedToCreateGameError = () => new Error("FAILED_TO_CREATE_GAME")
const failedToSubmitAnswersError = () => new Error("FAILED_TO_SUBMIT_ANSWERS")
const invalidFiltersDataError = () => new Error("INVALID_FILTERS_PROVIDED")


const constructMarkQuestionAsFetchedObject = curry((tableName, qid) => ({
    TableName: tableName,
    Key: {
        "_id": qid
    },
    UpdateExpression: "set questions[0].fetched = :acceptedValue",
    ExpressionAttributeValues: {
        ":acceptedValue": true,
    }
}))


const constructGetPendingGameObject = curry((tableName, gid) => ({
    TableName: tableName,
    KeyConditionExpression: '#gameId = :id',
    FilterExpression: 'active = :active',
    ExpressionAttributeNames: {
        '#gameId': '_id',
    },
    ExpressionAttributeValues: {
        ':id': gid,
        ':active': true
    }
}))


const markQuestionAsFetchedSafe = curry((connector, tableName, questionId) => {

    if(!isValidTableName(tableName))
        return Promise.reject(invalidTableNameError())

    if(!isValidQuestionId(questionId)) {
        return Promise.reject(invalidQuestionIdError())
    }

    const update = get("update", connector)

    if(!update)
        return Promise.reject(failedToGetUpdateMethodError())

    const params = constructMarkQuestionAsFetchedObject(tableName, questionId)

    return update(params).promise().catch(err => {
        console.log(err)
        return Promise.reject(failedToMarkQuestionAsFetchedError())
    })
})


const getPendingGameSafe = curry((connector, tableName, gameId) => {
    if(!isValidTableName(tableName))
        return Promise.reject(invalidTableNameError())

    if(!isValidGameId(gameId)) {
        return Promise.reject(invalidGameIdError())
    }

    const query = get("query", connector)

    if(!query)
        return Promise.reject(failedToGetQueryMethodError())


    const params = constructGetPendingGameObject(tableName, gameId)

    return query(params).promise().catch(err => {
        console.log(err)
        return Promise.reject(failedToGetPendingGameError())
    })
})

const validateFilters = filters => {
    return  isValidCategory(get("subject", filters)) == true &&
            isValidLanguage(get("language", filters)) == true &&
            isValidLevel(get("level", filters)) == true &&
            isValidLimit(get("limit", filters)) == true
}

const convertQuestionsArrayToObjectForm = questions => {
    const questionsObj = {}
    questions.forEach(quest => {
        questionsObj[quest._id] = {
            ...quest
        }
    })
    return questionsObj
}

const constructCreateGameObject = curry((tableName, id, requestId, playerIds, questions, currentTime) => ({
    TableName: tableName,
    Item: {
        _id: id,
        request_id: requestId,
        players: playerIds,
        questions: questions,
        created_at: currentTime,
        updated_at: currentTime,
        active: true
    }
}))

const createGameSafe = curry(async (connector, generateQuize, getTime, generateId, tableName, requestId, playerIds, gameFilters) => {
    try {
        if(!isValidTableName(tableName))
            return Promise.reject(invalidTableNameError())

        if(!isValidRequestId(requestId))
            return Promise.reject(invalidRequestIdError())
            
        if(!isValidPlayerIds(playerIds))
            return Promise.reject(invalidPlayerIdsError())

        if(!validateFilters(gameFilters))
            return Promise.reject(invalidFiltersDataError())

        const put = get("put", connector)
        if(!put)
            return Promise.reject(failedToGetPutMethodError())


        const questions = await generateQuize(gameFilters)
        if(questions.length == 0) {
            return Promise.reject(failedToGetQuestionsError())
        }

        const currentTime = getTime()
        if(!currentTime)
            return Promise.reject(failedToGetCurrentTimeError())

        const id = generateId()
        if(id == null || id == undefined)
            return Promise.reject(failedToGenerateIdError())

        const questionsObj = convertQuestionsArrayToObjectForm(questions)
        
        const params = constructCreateGameObject(tableName, id, requestId, playerIds, questionsObj, currentTime)

        return put(params).promise().catch(err => {
            console.log(err)
            return Promise.reject(failedToCreateGameError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToCreateGameError())
    }
})


const constructSubmitAnswersObject = curry((tableName, gameId, playerId, questionId, answerIds, currentTime) => ({
    TableName: tableName,
    Key: {
        "_id": gameId
    },
    UpdateExpression: "set questions.#questionId.submitted_answers = :submittedAnswers",
    ExpressionAttributeNames: {
        '#questionId': questionId
    },
    ExpressionAttributeValues: {
        ":submittedAnswers": {[playerId]: {answers: answerIds, submittedAt: currentTime}}
    }
}))


const submitAnswersSafe = curry(async (connector, getTime, tableName, gameId, playerId, questionId, answerIds) => {
    if(!isValidTableName(tableName))
        return Promise.reject(invalidTableNameError())

    if(!isValidGameId(gameId))
        return Promise.reject(invalidGameIdError())

    if(!isValidPid(playerId))
        return Promise.reject(invalidPidError())
    
    if(!isValidQuestionId(questionId))
        return Promise.reject(invalidQuestionIdError())

    if(answerIds && answerIds.length === 0)
        return Promise.reject(invalidAnswerIdError())

    if(!isValidAnswerIds(answerIds))
        return Promise.reject(invalidAnswerIdsError())

    const update = get("update", connector)

    if(!update)
        return Promise.reject(failedToGetUpdateMethodError())


    try {
        const currentTime = getTime()
        if(!currentTime)
            return Promise.reject(failedToGetCurrentTimeError())

        const params = constructSubmitAnswersObject(
            tableName, gameId, playerId, questionId, answerIds, currentTime
        )
        await update(params).promise()
            
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToSubmitAnswersError())
    }

    
})





module.exports = {
    failedToGetUpdateMethodError,
    failedToGetPutMethodError,
    failedToGetQueryMethodError,
    failedToMarkQuestionAsFetchedError,
    failedToGetPendingGameError,
    failedToGetQuestionsError,
    failedToGetCurrentTimeError,
    failedToGenerateIdError,
    failedToCreateGameError,
    failedToSubmitAnswersError,
    invalidFiltersDataError,
    markQuestionAsFetchedSafe,
    getPendingGameSafe,
    createGameSafe,
    validateFilters,
    constructCreateGameObject,
    constructGetPendingGameObject,
    constructMarkQuestionAsFetchedObject,
    constructSubmitAnswersObject,
    convertQuestionsArrayToObjectForm,
    submitAnswersSafe,
    submitAnswer: markQuestionAsFetchedSafe(getConnector(), new Date().getTime),
    markQuestionAsFetched: markQuestionAsFetchedSafe(getConnector()),
    getPendingGame: getPendingGameSafe(getConnector()),
    createGame: createGameSafe(getConnector(), generateQuize, new Date().getTime, uuid.v4)
}




// class GameModel {
//     constructor(connector, questionsModel, uuid) {
//         this.questionsModel = questionsModel
//         this.uuid = uuid
//         this._connector = connector.connector()
//     }

//     get connector() {
//         return this._connector
//     }


//     async createGame(requestId, players, gameFilters) {
//         if(!requestId || !players || !gameFilters) {
//             return Promise.reject(new Error("REQUIRED_DATA_IS_MISSING"))
//         }
//         const currentTime = new Date().getTime();
//         const questions = await this.questionsModel.generateQuize({
//             level: gameFilters.level,
//             subject: gameFilters.subject, 
//             language: gameFilters.language, 
//             limit: gameFilters.limit
//         })
//         if(questions.length == 0) {
//             return Promise.reject(new Error("NO_QUESTION_FOUND"))
//         }
//         const questionsObj = {};
//         questions.forEach(quest => {
//             questionsObj[quest._id] = {
//                 ...quest
//             }
//         })
//         const socketParams = {
//             TableName: process.env.DYNAMODB_GAMES_TABLE,
//             Item: {
//                 _id: this.uuid.v4(),
//                 request_id: requestId,
//                 players: players,
//                 questions: questionsObj,
//                 created_at: currentTime,
//                 updated_at: currentTime,
//                 active: true
//             }
//         };
//         return this._connector.put(socketParams).promise();
//     }

//     getPendingGame(game) {
//         if(!game || !game.gameId) {
//             return Promise.reject(new Error("GAME_ID_IS_INVALID"))
//         }
//         const queryParams = {
//             TableName: process.env.DYNAMODB_GAMES_TABLE,
//             KeyConditionExpression: '#gameId = :id',
//             FilterExpression: 'active = :active',
//             ExpressionAttributeNames: {
//                 '#gameId': '_id',
//             },
//             ExpressionAttributeValues: {
//                 ':id': game.gameId,
//                 ':active': true
//             }
//         };

//         return this._connector.query(queryParams).promise();
//     }

//     markQuestionAsFetched(qid) {
//         if(!qid) {
//             return Promise.reject(new Error("INVALID_QUESTION_ID"))
//         }
//         const queryParams = {
//             TableName: process.env.DYNAMODB_GAMES_TABLE,
//             Key:{
//                 "_id": qid
//             },
//             UpdateExpression: "set questions[0].fetched = :acceptedValue",
//             ExpressionAttributeValues: {
//                 ":acceptedValue": true,
//             }
//         };

//         return this._connector.update(queryParams).promise();
//     }
// }


// module.exports = () => {
//     const bottle = require('bottlejs').pop("click")
//     bottle.service("model.game", GameModel, "connector.dynamodb", "model.questions", "lib.uuid")
// }