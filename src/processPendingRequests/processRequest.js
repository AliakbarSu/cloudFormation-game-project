let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get, getOr } = require("lodash/fp")
const { isValidRequestId } = require(layerPath + 'utils/validators/index')
const { invalidRequestIdError } = require(layerPath + 'utils/errors/general')
const { getPendingRequest } = require(layerPath + 'models/request.model')
const { createGame } = require(layerPath + 'models/game.model')

const failedToProcessRequestError = () => new Error("FAILED_TO_PROCESS_REQUEST")
const failedToGetPendingRequestError = () => new Error("FAILED_TO_GET_PENDING_REQUEST_ERROR")
const failedToConvertPlayersObjectToArrayFormError = () => new Error("FAILED_TO_CONVERT_OBJECT_TO_ARRAY_FORM")


const convertPlayersObjectToArrayForm = curry(async (converter, playersObj) => {
    try {
        const result = converter(playersObj)
        const mapedResult = result.map(key => ({...playersObj[key]}))
        return Promise.resolve(mapedResult)
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToConvertPlayersObjectToArrayFormError())
    }
})

const constructGameParamsObject = curry((subject, level, language, limit) => ({
    subject,
    level,
    language,
    limit
}))


const processRequestSafe = curry(async (getPendingRequest, createGame, converter, limit, requestId) => {
    
    if(!isValidRequestId(requestId))
        return Promise.reject(invalidRequestIdError())
    
    try {
        const result = await getPendingRequest(requestId)
        const pendingRequest = getOr([], "Items", result)[0]

        if(!pendingRequest)
            return Promise.reject(failedToGetPendingRequestError())

        const category = get("category", pendingRequest)
        const language = get("language", pendingRequest)
        const level = get("level", pendingRequest)
        const players = get("players", pendingRequest)
        const playersArray = await convertPlayersObjectToArrayForm(converter, players)
        const readyPlayers = playersArray.filter(p => p.accepted == true)

        if(readyPlayers.length === 0)
            return Promise.resolve("NO_PLAYERS_HAS_ACCEPTED_THE_REQUEST")

        const params = constructGameParamsObject(category, level, language, limit)
        await createGame(requestId, players, params)
        return Promise.resolve("GAME_CREATED_SUCCESSFULLY")
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToProcessRequestError())
    }
})


module.exports = {
    failedToProcessRequestError,
    failedToGetPendingRequestError,
    failedToConvertPlayersObjectToArrayFormError,
    convertPlayersObjectToArrayForm,
    constructGameParamsObject,
    processRequestSafe,
    processRequest: processRequestSafe(
        getPendingRequest(process.env.DYNAMODB_REQUESTS_TABLE), 
        createGame(process.env.DYNAMODB_GAMES_TABLE), 
        Object.keys, 
        process.QUESTIONS_LIMIT)
}

