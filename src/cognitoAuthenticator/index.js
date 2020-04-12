
// Bootstraps the application
require(process.env.DEV ? '../opt/nodejs/container' : '/opt/nodejs/container')

const main = bottle => {
    function _handler (cognitoConnector, mapError)  {
        return async (event, context) => {
    
            const data = event;
            const user = data.username;
            const password = data.password;
        
            try {
                const result = await cognitoConnector.authenticateUser(user, password)
                const response = {
                    token: result.tokenId,
                    refresh: result.refreshToken,
                    user
                }
                
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin': "*"
                    },
                    body: JSON.stringify(response)
                }
            }catch(err) {
                console.log(err);
                const mapedError = mapError(err, context)
                return Promise.reject(mapedError)
            }
        }
    }


    bottle.service("cognitoAuthenticator", _handler, "connector.cognito", "utils.mapError")
    return bottle.container.cognitoAuthenticator
}


exports.handler = (...args) => main(require('bottlejs').pop("click"))(...args)
