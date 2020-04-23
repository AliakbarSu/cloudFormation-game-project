let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"
const { curry, get } = require('lodash/fp')
const AmazonCognitoIdentity = require('amazon-cognito-identity-js')

const {
    isValidUserPool,
    isValidClientId,
    isValidEmail,
    isValidSignUpUsername,
    isValidPassword
} = require(layerPath + 'utils/validators/index')
const {
    invalidUserPoolError,
    invalidClientIdError,
    invalidEmail,
    invalidSignUpUsernameError,
    invalidPasswordError
} = require(layerPath + 'utils/errors/general')


const failedToGetSignUpMethodError = () => new Error("FAILED_TO_GET_SIGN_UP_METHOD")
const encounteredErrorWhileCallingSignUpMethod = () => new Error("ENCOUNTERED_ERROR_WHILE_CALLING_SIGNUP")

const failedToSignUpUserInternalError = (context) => ({
    errorType : "InternalServerError",
    httpStatus : 500,
    requestId : context.awsRequestId,
    message : "An unknown error has occurred. Please try again."
})

const failedToSignUpUserInputsError = curry((context, message) => ({
    errorType : "Invalid input data",
    httpStatus : 400,
    requestId : context.awsRequestId,
    message : message
}))

const constructPoolDataObject = curry((UserPoolId, ClientId) => ({
    UserPoolId,
    ClientId, 
}))


const constructUserAttributeObject = curry((Name, Value) => ({
    Name,
    Value
}))


const successResponseObject = curry((username) => ({
    statusCode: 200,
    body:`${username} was created successfully`,
}))


const signUpUser = curry((signUp, email, password, attributes) => {
    return new Promise((success, failed) => {
        signUp(email, password, attributes, null, (err, data) => {
            if(err) {
                console.log(err)
                failed(encounteredErrorWhileCallingSignUpMethod())
            }else
                success(data)
        })
    })
})


const handlerSafe = curry(async (getCognitoUserPool, getCognitoUserAttributes, userPoolId, clientId, event, context) => {

    if(!isValidUserPool(userPoolId)) {
        console.log(invalidUserPoolError())
        return Promise.reject(failedToSignUpUserInternalError(context))
    }
        
    if(!isValidClientId(clientId)) {
        console.log(invalidClientIdError())
        return Promise.reject(failedToSignUpUserInternalError(context))
    }

    const email = get("email", event)
    const username = get("username", event)
    const password = get("password", event)

    if(!isValidEmail(email))
        return Promise.reject(failedToSignUpUserInputsError(context, invalidEmail().message))

    if(!isValidSignUpUsername(username))
        return Promise.reject(failedToSignUpUserInputsError(context, invalidSignUpUsernameError().message))
        
    if(!isValidPassword(password))
        return Promise.reject(failedToSignUpUserInputsError(context, invalidPasswordError().message))

    try {
    
        const userData = constructPoolDataObject(userPoolId, clientId)
        const cognitoUserPool = getCognitoUserPool(userData)
        const signUp = get("signUp", cognitoUserPool)

        if(!signUp) {
            console.log(failedToGetSignUpMethodError())
            return Promise.reject(failedToSignUpUserInternalError(context))
        }

        const userAttributesList = [
            constructUserAttributeObject("email", email),
            constructUserAttributeObject("username", username)
        ]

        const mapedUserAttributesList = userAttributesList.map(attribute => getCognitoUserAttributes(attribute))
        const {user} = await signUpUser(signUp, email, password, mapedUserAttributesList)
        const createUser = user()

        return Promise.resolve(successResponseObject(createUser))

    }catch(err) {
        console.log(err)
        return Promise.reject(failedToSignUpUserInternalError(context))
    }

})


module.exports = {
    failedToSignUpUserInternalError,
    failedToSignUpUserInputsError,
    failedToGetSignUpMethodError,
    encounteredErrorWhileCallingSignUpMethod,
    constructPoolDataObject,
    constructUserAttributeObject,
    successResponseObject,
    signUpUser,
    handlerSafe,
    constructPoolDataObject,
    handler: handlerSafe(
        poolData => new AmazonCognitoIdentity.CognitoUserPool(poolData),
        attribute => new AmazonCognitoIdentity.CognitoUserAttribute(attribute),
        process.env.USER_POOL_ID,
        process.env.USER_POOL_CLIENT_ID
    )
}










// global.fetch = require('node-fetch');



// exports.handler = (event, context, callback) => {
//     // TODO implement
//     var poolData = {
//         UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
//         ClientId: process.env.USER_POOL_CLIENT_ID, // Your client id here
//     };
//     var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData)
     
//     var attributeList = [];
     
//     var dataEmail = {
//         Name: 'email',
//         Value: event.email,
//     };
    
    
//     var dataFamilyName = {
//         Name: 'family_name',
//         Value: event.surname,
//     };
    
//     var dataName = {
//         Name: 'given_name',
//         Value: event.name,
//     };
    
//     var dataBirthdate = {
//         Name: 'birthdate',
//         Value: event.dob,
//     };
    
    
//     var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
//     var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(
//         dataFamilyName
//     );
//     var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(
//         dataName
//     );
//     var attributeBirthdate = new AmazonCognitoIdentity.CognitoUserAttribute(
//         dataBirthdate
//     );
     
//     attributeList.push(attributeEmail);
//     attributeList.push(attributeFamilyName);
//     attributeList.push(attributeGivenName);
//     attributeList.push(attributeBirthdate);
     
//     userPool.signUp(event.username, event.password, attributeList, null, function(
//         err,
//         result
//     ) {
//         if (err) {
//             console.log(err.message || JSON.stringify(err));
//             var myErrorObj = {
//                 errorType : "InternalServerError",
//                 httpStatus : 500,
//                 requestId : context.awsRequestId,
//                 message : "An unknown error has occurred. Please try again."
//             }
//             callback(JSON.stringify(myErrorObj))
//         }
//         var cognitoUser = result.user;
//         const response = {
//             statusCode: 200,
//             body: cognitoUser.getUsername() + " was created successfully",
//         };
//         callback(null, response);
//     });
// };
