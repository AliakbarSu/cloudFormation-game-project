const { curry } = require('lodash/fp')


module.exports = curry((error, context) => {
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

    return errorObj
})