

// Bootstraps the application
require(process.env.DEV ? '../opt/nodejs/container' : '/opt/nodejs/container')
// require('./generatePolicies')



function _handler(generateAllow, generateDeny, parseToken) {
    return async (event, context) => {
        console.log(generateAllow)

        const methodArn = event.methodArn;
        const token = event.queryStringParameters.Authorizer;
    
        if (!token) {
            return context.fail('Unauthorized');
        } 
        
        try {
            const claims = await parseToken(token)
            const allowPolicy = generateAllow('me', methodArn, claims.email)
            context.succeed(allowPolicy);
        }catch(err) {
            console.error(err)
            return context.fail('Unauthorized');
        }
    }
}

const bottle = require('bottlejs').pop("click")
bottle.service("cognitoAuthorizer", _handler, "generateAllow", "generateDeny", "utils.parseToken")


exports.handler = bottle.container.cognitoAuthorizer