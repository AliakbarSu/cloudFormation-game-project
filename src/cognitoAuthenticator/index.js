const CONSTANTS = require('/opt/nodejs/constants');
const cognitoConnector = require('/opt/nodejs/cognito.connector');

exports.handler = async (event, context, callback) => {

    try {
        const data = event;

        const user = data.username;
        const password = data.password;
        
        const result = await cognitoConnector.authenticateUser(user, password);
        const response = {
            token: result.tokenId,
            refresh: result.refreshToken,
            user
        };
        
        
        const res = {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': "*"
            },
            body: JSON.stringify(response)
        }
        callback(null, res)
        
    } catch (error) {
        console.log(error);
        var errorObj = {};
        switch (error.code) {
            case 'NotAuthorizedException':
                errorObj.errorType = "Authentication Error";
                errorObj.httpStatus = 401;
                errorObj.requestId = context.awsRequestId;
                errorObj.message = "The provided credentials are incorrect."
                break;
                
            case 'UserNotConfirmedException':
                errorObj.errorType = "Authentication Error";
                errorObj.httpStatus = 409;
                errorObj.requestId = context.awsRequestId;
                errorObj.message = "The email address is not confirmed yet."
                break;
                
            case 'UserNotFoundException':
                errorObj.errorType = "Authentication Error";
                errorObj.httpStatus = 404;
                errorObj.requestId = context.awsRequestId;
                errorObj.message = "The provided credentials do not match our records."
                break;
                
            case 'PasswordResetRequiredException':
                errorObj.errorType = "Authentication Error";
                errorObj.httpStatus = 409;
                errorObj.requestId = context.awsRequestId;
                errorObj.message = "You need to reset the password for this user."
                break;
            
            default:
                errorObj.errorType = "InternalServerError";
                errorObj.httpStatus = 500;
                errorObj.requestId = context.awsRequestId;
                errorObj.message = "An unkown error has occured. Please try again."
        }
        callback(JSON.stringify(errorObj))
    }
};
