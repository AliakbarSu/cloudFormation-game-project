let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"
const { curry, get, getOr } = require('lodash/fp')
const { isValidGameId } = require(layerPath + 'utils/validators/index')
const { invalidGameIdError } = require(layerPath + 'utils/errors/general')
const { schedulePointsTransfer } = require(layerPath + 'connectors/sqs.connector')
const { getPlayersConIds } = require(layerPath + 'models/players.model')
const { getPendingGame } = require(layerPath + 'models/game.model')
const { broadcastMessages } = require(layerPath + 'connectors/apigateway.connector')


const failedToProcessResultError = () => new Error("FAILED_TO_PROCESS_RESULT")
const failedToConvertObjectToArrayFormError = () => new Error("FAILED_TO_CONVERT_OBJECT_TO_ARRAY_FORM")
const failedToGetQuestionsError = () => new Error("FAILED_TO_GET_QUESTIONS")
const failedToGetPlayersError = () => new Error("FAILED_TO_GET_PLAYERS")
const failedToSchedulePointsTransferError = () => new Error("FAILED_TO_SCHEDULE_POINTS_TRANSFER")
const failedToGetPlayerConnectionIdsError = () => new Error("FAILED_TO_GET_PLAYERS_CONNECTION_IDS")
const biasOutOfRangeError = () => new Error("BIAS_IS_OUT_OF_RANGE")

const convertObjectToArrayForm = curry((converter, object) => {
    try {
        const keys = converter(object)
        const array = keys.map(key => ({...object[key], _id: key}))
        return Promise.resolve(array)
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToConvertObjectToArrayFormError())
    }
}) 

const mapCorrectAnswersToQuestion = questions => {
    const newQuestions = questions.map(question => {
        const answers = question.answers.filter(answer => answer.isCorrect)
        return {
            ...question,
            correctAnswers: answers.map(an => an._id)
        }
    })
    return newQuestions
}

const calculateNumberOfCorrectAnswers = (converter, questions) => {
    return questions.map(async question => {
        const result = {}

        const submitted = question.submitted_answers
        const players = await convertObjectToArrayForm(converter, submitted)
        
        const mapedPlayers = players.map(p => {
            const correctAnswers = p.answers.filter( ai => question.correctAnswers.includes(ai) )
            const wrongAnswers = p.answers.filter( ai => !question.correctAnswers.includes(ai) )
            const gotCorrect = correctAnswers.length === question.correctAnswers.length
            const answeredIn =  p.submitted_at - question.fetched_at
            return {
                ...p,
                qid: question._id,
                allAnswers: question.answers.map(an => an._id), 
                correctAnswers, 
                wrongAnswers, 
                gotCorrect,
                answeredIn
            }
        })

        mapedPlayers.forEach(p => {
            result[p._id] = {summary: p}
        })
        return result
    })
}

const constructGameResultMessage = curry((message, data) => ({
    message,
    data
}))


const mapPlayersToQuestions = curry(async (converter, submitted_players) => {
    const mapedPlayers = await Promise.all(submitted_players.map(async player => 
        await convertObjectToArrayForm(converter, player)))

    const flattenedPlayers = mapedPlayers.flat()
    const uniquePlayers = [...new Set(flattenedPlayers.map(q => q._id))]

    const convertedPlayers = Array.from(uniquePlayers, player_id => ({
        _id: player_id, 
        data: flattenedPlayers.filter(str => str._id === player_id),
    }))
    return convertedPlayers
})

const compareByReduce = curry((array, field, comparator) => {
    // 1 = greater sign
    return array.map(e => [e]).reduce((prev, current) => {
        if(prev[0][field] > current[0][field])
            return comparator == 1 ? prev : current
        else if(prev[0][field] < current[0][field])
            return comparator == 1 ? current : prev
        else 
            return [...prev, ...current]
    })
}) 

const compareResults = (scores) => {
    const creterias = [
        compareByReduce(scores, "score", 1),
        compareByReduce(scores, "averageAnsweredTime", 0)
      ]
    
    const appliedScorePoints = scores.map(score => {
        const mapedCreterias = creterias.map(creteria => creteria.map(c => c._id).includes(score._id ) ? 1 : 0)
        return {
            ...score,
            points: mapedCreterias.reduce((total, current) => total + current)
        }
    })

    const winnerPlayer = compareByReduce(appliedScorePoints, "points", 1)
    return winnerPlayer
}

const assignScoreToPlayers = players => {
    return players.map(player => {
        const totalAnsweredTime = player.data.map(d => d.summary.answeredIn)
        .reduce((total, current) => total + current)
        return {
            ...player,
          score: player.data.map(data => data.summary.gotCorrect)
                .filter((gotCorrect) => gotCorrect).length / player.data.length,
          averageAnsweredTime: totalAnsweredTime / player.data.length
        }
    })
}

const applyBiasedSelection = curry((choises, playerId) => {
    const winner = choises.find(player => player._id === playerId)
    if(winner)
        return Promise.resolve(winner)
    else
        return Promise.reject(biasOutOfRangeError())
})

const desideFinalWinner = curry(async (winners, getPlayersPoints) => {
    if(winners.length > 1) {
        const playersPoints = await getPlayersPoints(winners.map(w => w._id))
        const playerWithHighestScore = compareByReduce(playersPoints, "points", 1)[0]
        return applyBiasedSelection(winners, playerWithHighestScore._id)
    }else {
        return Promise.resolve(winners[0])
    }
})


const processResultSafe = curry(async (getGame, broadcastMessages, getPlayersConIds, getPlayersPoints, schedulePointsTransfer, converter, gameId) => {
    if(!isValidGameId(gameId))
        return Promise.reject(invalidGameIdError())

    try {
        const result = await getGame(gameId)
        const game = getOr([], "Items", result)[0]
        const questions = get("questions", game)
        const points = get("points", game)
        const players = get("players", game)

        if(!questions)
            return Promise.reject(failedToGetQuestionsError())
            
        if(!players)
            return Promise.reject(failedToGetPlayersError())

        const questionsArray = await convertObjectToArrayForm(converter, questions)
        const playersArray = await convertObjectToArrayForm(converter, players)

        const mapedQuestions = await Promise.all(questionsArray.map(async q => 
            ({...q, answers: await convertObjectToArrayForm(converter, q.answers)})))

        const filteredQuestions = mapCorrectAnswersToQuestion(mapedQuestions)
         
        const playersResult = await Promise.all(calculateNumberOfCorrectAnswers(converter, filteredQuestions))

        const mapedPlayers = await mapPlayersToQuestions(converter, playersResult)
        const scores = assignScoreToPlayers(mapedPlayers)
        const winners = compareResults(scores)

        const winnerPlayer = await desideFinalWinner(winners, getPlayersPoints)

        
        const playerIds = playersArray.map(p => p._id)
        const playersConnectionIds = await getPlayersConIds(playerIds)
        if(!playersConnectionIds || playersConnectionIds.length == 0)
            return Promise.reject(failedToGetPlayerConnectionIdsError())


        const message = constructGameResultMessage("GAME RESULTS", winnerPlayer)
        await broadcastMessages(playersConnectionIds, message)

        await schedulePointsTransfer("to", winnerPlayer._id, points).catch(err => {
            console.log(err)
            return Promise.reject(failedToSchedulePointsTransferError())
        })

        return winnerPlayer

    }catch(err) {
        console.log(err)
        if(err.message == failedToSchedulePointsTransferError().message) {
            return Promise.reject(err)
        }
        return Promise.reject(failedToProcessResultError())
    }
})

module.exports = {
    failedToGetPlayersError,
    failedToSchedulePointsTransferError,
    failedToGetQuestionsError,
    failedToProcessResultError,
    failedToConvertObjectToArrayFormError,
    failedToGetPlayerConnectionIdsError,
    desideFinalWinner,
    biasOutOfRangeError,
    compareByReduce,
    mapPlayersToQuestions,
    applyBiasedSelection,
    assignScoreToPlayers,
    compareResults,
    convertObjectToArrayForm,
    constructGameResultMessage,
    calculateNumberOfCorrectAnswers,
    mapCorrectAnswersToQuestion,
    processResultSafe,
    processResult: processResultSafe(
        getPendingGame(process.env.DYNAMODB_GAMES_TABLE), 
        broadcastMessages({ endpoint: process.env.WEBSOCKET_API_ENDPOINT }), 
        getPlayersConIds(process.env.MONGO_DB_URI), 
        schedulePointsTransfer(process.env.PENDING_POINTS_TRANSFERS_QUE_URL), 
        Object.keys)
}