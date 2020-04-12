
const processRequest = (gameModel, requestModel) => async (request) => {
    try {
        const results = await requestModel.getPendingRequest(request);
        const requestData = results.Items[0];
        if(results.Count > 0) {
            const playersObjKeys = Object.keys(requestData.players)
            const playersArray = playersObjKeys.map(key => ({...requestData.players[key]}))
            const readyPlayers = playersArray.filter(p => p.accepted == true);
            if(readyPlayers.length > 0) {
                return gameModel.createGame(
                    request.requestId, 
                    requestData.players,
                    {
                        level: requestData.level,
                        subject: requestData.category,
                        language: requestData.language,
                        limit: 5
                    }
                )
            }else {
                // cancel request and notify user
                console.log(`for request with ID ${request}, no player accepted the request`)
                return;
            }
        }else {
            return Promise.resolve("Nothing found")
        } 
    }catch(err) {
        err.requestId = request.requestId
        throw err;
    }
}

module.exports = processRequest