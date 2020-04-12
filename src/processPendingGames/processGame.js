
const processGame = (playerModel, gameModel, apigatewayConnector, sqsConnector) => async (game) => {
    try {
        const playersConIds = await playerModel.getPlayersConIds(Object.keys(game.players));
        const new_question_message = {
            gid: game.gameId,
            question: game.questions[0]
        }

        return Promise.all([
            apigatewayConnector.broadcastMessage(playersConIds, {message: "GAME_QUESTION", data: new_question_message}),
            gameModel.markQuestionAsFetched(new_question_message.gid),
            sqsConnector.scheduleNextQuestion(new_question_message.gid)
        ]).catch(errArray => {
            if(errArray[0]) {
                if(errArray[0].name == "CONNECTING_TO_PLAYER") {
                    console.log("Could not send request to one of the clients", errArray)
                }
            }else {
                throw errArray
            }
        })
       
    }catch(err) {
        return Promise.reject(err)
    }
}

module.exports = processGame