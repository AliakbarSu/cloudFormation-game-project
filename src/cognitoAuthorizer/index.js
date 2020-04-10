let resourcesPath = "../opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AUTH_UTIL = require(resourcesPath + "utils/auth.util")


const CONSTANTS = require('/opt/nodejs/constants');
const cognitoConnector = require('/opt/nodejs/cognito.connector');

// FIXME: I don't really feel like these fit in here as util functions, but they don't fit in a connector either...
const generatePolicy = function (principalId, effect, resource, userEmail) {
    const authResponse = {};
    authResponse.context = {};
    authResponse.context.userEmail = userEmail;
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        // default version
        policyDocument.Version = "2012-10-17";
        policyDocument.Statement = [];
        const statementOne = {};
        // default action
        statementOne.Action = "execute-api:Invoke";
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    return authResponse;
};

const generateAllow = function (principalId, resource, userEmail) {
    return generatePolicy(principalId, "Allow", resource, userEmail);
};

const generateDeny = function (principalId, resource) {
    return generatePolicy(principalId, "Deny", resource);
};

exports.handler = async (event, context) => {

     // Read input parameters from event
    const methodArn = event.methodArn;
    const token = event.queryStringParameters.Authorizer;

    if (!token) {
        return context.fail('Unauthorized');
    } else {
        // Get the kid from the headers prior to verification
        const sections = token.split('.');
        let header = jose.util.base64url.decode(sections[0]);
        header = JSON.parse(header);
        const kid = header.kid;

        // Fetch known valid keys
        const rawRes = await fetch(CONSTANTS.KEYS_URL);
        const response = await rawRes.json();

        if (rawRes.ok) {
            const keys = response['keys'];
            const foundKey = keys.find((key) => key.kid === kid);

            if (!foundKey) {
                context.fail('Public key not found in jwks.json');
            } else {
                try {
                    const result = await jose.JWK.asKey(foundKey);
                    const keyVerify = jose.JWS.createVerify(result);
                    const verificationResult = await keyVerify.verify(token);

                    const claims = JSON.parse(verificationResult.payload);
                    // Verify the token expiration
                    const currentTime = Math.floor(new Date() / 1000);
                    if (currentTime > claims.exp) {
                        console.error('Token expired!');
                        context.fail('Token expired!');
                    } else if (claims.aud !== CONSTANTS.COGNITO_USER_POOL_CLIENT) {
                        console.error('Token wasn\'t issued for target audience');
                        context.fail('Token was not issued for target audience');
                    } else {
                        context.succeed(generateAllow('me', methodArn, claims.email));
                    }
                } catch (error) {
                    console.error('Unable to verify token', error);
                    context.fail('Signature verification failed');
                }
            }
        }else {
            console.log("firing from else statementOne")
        }
    }
};