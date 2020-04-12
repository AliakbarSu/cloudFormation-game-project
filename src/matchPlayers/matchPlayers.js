let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const bottle = require(resourcesPath + 'container')

bottle.service("matchPlayers", matchPlayers, "model.player", "model.request", "connector.apigateway", "connector.sqs")

function matchPlayers (playersModel, requestModel, apigatewayConnector, sqsConnector) {
    return async (event, context) => {
        context.callbackWaitsForEmptyEventLoop = false;
        const userData = {...event.detail.fullDocument, location: {}};
        userData.location.long = event.detail.fullDocument.location.coordinates[0]
        userData.location.lat = event.detail.fullDocument.location.coordinates[1]
    
        const foundPlayers = await playersModel.searchForPlayers(data)
    
        if(foundPlayers.length > 0) {
            const connectionIds = [data.connectionId, ...foundPlayers.map(doc => doc.connectionId)]
          
            const request = {
                message: "REQUEST",
                data: "TEST REQUEST"
            }
            const players = [
                {
                    pid: data._id,
                    connectionId: data.connectionId
                },
                ...foundPlayers.map(p => {
                    return {
                        pid: p._id,
                        connectionId: p.connectionId
                    }
                })
            ]
            
            await Promise.all([
                await apigatewayConnector.broadcastMessage(connectionIds, JSON.stringify(request)),
                await playersModel.markPlayersAsPlaying([data._id, ...foundPlayers.map(doc => doc._id)])
            ]).catch(errArray => {
                if(errArray[0]) {
                    if(errArray[0].name == "CONNECTING_TO_PLAYER") {
                        console.log("Could not send request to one of the clients", errArray)
                    }
                }else {
                    throw errArray
                }
            })
    
            const requestId = await requestModel.addRequest(players)
            return sqsConnector.addRequest(requestId, [data._id, ...foundPlayers.map(doc => doc._id)], data.level, data.category, data.language)
           
        }
        return;      
    }
}

module.exports = bottle.container.matchPlayers