'use strict';

const { curry, get } = require('lodash/fp')
const {
    isValidUsername,
    isValidPassword,
    isValidUserPool,
    isValidToken
} = require('../utils/validators/index')
const { 
    invalidTokenError,
    invalidPasswordError, 
    invalidUserPoolError,
    invalidUsernameError } = require('../utils/errors/general')


const failedToAuthenticateUserError = () => new Error("FAILED_TO_AUTHENTICATE_USER")
const failedToGetAccessTokenError = () => new Error("FAILED_TO_GET_ACCESS_TOKEN")
const failedToGetRefreshTokenError = () => new Error("FAILED_TO_GET_REFRESH_TOKEN_TOKEN")
const failedToGetIdTokenError = () => new Error("FAILED_TO_GET_ID_TOKEN")
const failedToGetAccesTokenMethodError = () => new Error("FAILED_TO_GET_ACCESS_TOKEN_METHOD")
const failedToGetRefreshTokenMethodError = () => new Error("FAILED_TO_GET_REFRESH_TOKEN_METHOD")
const failedToGetgetTokenMethodError = () => new Error("FAILED_TO_GET_GET_TOKEN_METHOD")
const failedToGetIdTokenMethodError = () => new Error("FAILED_TO_GET_ID_TOKEN_METHOD")
const failedToGetAuthenticationDetailsError = () => new Error("FAILED_TO_GET_AUTHENTICATION_DETAILS")
const failedToGetCognitoUserError = () => new Error("FAILED_TO_GET_COGNITO_USER")
const failedTogetRefreshSessionMethodError = () => new Error("FAILED_TO_GET_REFRESH_SESSION_METHOD")
const failedToGetAuthenticateUserMethodError = () => 
    new Error("FAILED_TO_GET_AUTHENTICATE_USER_METHOD")
const failedToGetCompleteNewPasswordChallengeMethodError = () => 
    new Error("FAILED_TO_GET_COMPLETE_NEW_PASSWORD_CHALLENGE_METHOD")
const invalidRefreshSessionMethodError = () => new Error("INVALID_REFRESH_SESSION_METHOD_PROVIDED")
const failedToRefreshTokenError = () => new Error("FAILED_TO_REFRESH_TOKEN")





const refresh = curry((_refreshSession, token) => {
    if(!_refreshSession)
        return Promise.reject(invalidRefreshSessionMethodError())

    if(!isValidToken(token))
        return Promise.reject(invalidTokenError())

    return new Promise((resolve, reject) => {
        _refreshSession(token, async (err, session) => {
            if (err)
                reject(err)
            else {
                const IDsMethod = await extractTokenMethods(session)
                const getAccessToken = IDsMethod.accessToken.getJwtToken
                const getRefreshToken = IDsMethod.refreshToken.getToken
                const getIdToken = IDsMethod.idToken.getJwtToken
                resolve(getTokens(getAccessToken, getRefreshToken, getIdToken))
            }
        })
    })
})


const refreshTokenSafe = curry(async (getCognitoRefreshToken, getCognitoUser, userPool, username, token) => {
    try {
        if(!isValidUsername(username))
        return Promise.reject(invalidUsernameError())
    
        if(!isValidToken(token))
            return Promise.reject(invalidTokenError())

        if(!isValidUserPool(userPool))
            return Promise.reject(invalidUserPoolError())

        const refreshToken = getCognitoRefreshToken({RefreshToken: token})

        if(!refreshToken)
            return Promise.reject(failedToGetRefreshTokenError())

        const cognitoDataUserObj = await constructCognitoUserObject(username, userPool)
        const cognitoUserObj = getCognitoUser(cognitoDataUserObj)

        if(!cognitoUserObj)
            return Promise.reject(failedToGetCognitoUserError())

        const _refreshToken = get("refreshToken", cognitoUserObj)
        const _getToken = get("getToken", refreshToken)
        const _refreshSession = get("refreshSession", cognitoUserObj)

        if(!_refreshToken) 
                return Promise.reject(failedToGetRefreshTokenMethodError())
        
        if(!_refreshSession) 
            return Promise.reject(failedTogetRefreshSessionMethodError())

        if(!_getToken) 
            return Promise.reject(failedToGetgetTokenMethodError())
        _getToken()

        return refresh(_refreshSession, _refreshToken)

    }catch(err) {
        console.log(err)
        return Promise.reject(failedToRefreshTokenError())
    }
    
})




const constructAuthenticationData = curry((username, password) => {
    if(!isValidPassword(password)) {
        return Promise.reject(invalidPasswordError())
    }
    if(!isValidUsername(username)) {
        return Promise.reject(invalidUsernameError())
    }
    return Promise.resolve({
        Username: username,
        Password: password
    })
})


const constructCognitoUserObject = curry((username, pool) => {
    if(!isValidUserPool(pool)) {
        return Promise.reject(invalidUserPoolError())
    }
    if(!isValidUsername(username)) {
        return Promise.reject(invalidUsernameError())
    }
    return Promise.resolve({
        Username: username,
        Pool: pool
    })
})


const extractTokenMethods = curry((result) => {
    const getAccessToken = get("getAccessToken", result)
    const getRefreshToken = get("getRefreshToken", result)
    const getIdToken = get("getIdToken", result)
    if(!getAccessToken) {
        return Promise.reject(failedToGetAccesTokenMethodError())
    }
    if(!getRefreshToken) {
        return Promise.reject(failedToGetRefreshTokenMethodError())
    }
    if(!getIdToken) {
        return Promise.reject(failedToGetIdTokenMethodError())
    }
    return Promise.resolve({
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        idToken: getIdToken()
    })
})

const createTokensObject = curry((accessToken, refreshToken, tokenId) => ({
    accessToken,
    refreshToken,
    tokenId
}))


const getTokens = curry((getAccessToken, getRefreshToken, getIdToken) => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()
    const tokenId = getIdToken()

    if(!accessToken) {
        return Promise.reject(failedToGetAccessTokenError())
    }
    if(!refreshToken) {
        return Promise.reject(failedToGetRefreshTokenError())
    }
    if(!tokenId) {
        return Promise.reject(failedToGetIdTokenError())
    }
 
    return Promise.resolve(createTokensObject(accessToken, refreshToken, tokenId))
})


const authenticate = curry((
    _authenticateUser, 
    _completeNewPasswordChallenge, 
    authDetails) => {

    return new Promise((success, failed) => {
        _authenticateUser(authDetails, {
            onSuccess: async (result) => {
                // Authenticate a user section
                try {
                    const IDsMethod = await extractTokenMethods(result)
                    const getAccessToken = IDsMethod.accessToken.getJwtToken
                    const getRefreshToken = IDsMethod.refreshToken.getToken
                    const getIdToken = IDsMethod.idToken.getJwtToken
                    success(getTokens(getAccessToken, getRefreshToken, getIdToken))
                }catch(err) {
                    failed(err)
                }
                
            },
            newPasswordRequired: async function (userAttributes, requiredAttributes) {
    
                delete userAttributes.email_verified
                delete userAttributes.phone_number_verified
    
                _completeNewPasswordChallenge(
                    authenticationDetails.getPassword(),
                    userAttributes,
                    this
                );
                success()
                
            },
            onFailure: (error) => {
                failed(error)
            }
        })
    }) 
    
})


const authenticateUserSafe = curry(async (getAuthenticationDetails, getCognitoUser, userPool, username, password) => {
    try {
        const authData = await constructAuthenticationData(username, password)
        const authDetails = getAuthenticationDetails(authData)

        if(!authDetails)
            return Promise.reject(failedToGetAuthenticationDetailsError())

        const cognitoDataUserObj = await constructCognitoUserObject(username, userPool)
        const cognitoUserObj = getCognitoUser(cognitoDataUserObj)

        if(!cognitoUserObj)
            return Promise.reject(failedToGetCognitoUserError())

        const _authenticateUser = get("authenticateUser", cognitoUserObj)
        const _completeNewPasswordChallenge = get("completeNewPasswordChallenge", cognitoUserObj)

        if(!_authenticateUser)
            return Promise.reject(failedToGetAuthenticateUserMethodError())

        if(!_completeNewPasswordChallenge) 
            return Promise.reject(failedToGetCompleteNewPasswordChallengeMethodError())

        return authenticate(_authenticateUser, _completeNewPasswordChallenge, authDetails)

    }catch(err) {
        console.log(err)
        return Promise.reject(failedToAuthenticateUserError())
    }
})


module.exports = {
    invalidRefreshSessionMethodError,
    failedTogetRefreshSessionMethodError,
    failedToGetRefreshTokenError,
    failedToAuthenticateUserError,
    failedToGetgetTokenMethodError,
    failedToGetAccessTokenError,
    failedToGetAccesTokenMethodError,
    failedToGetCognitoUserError,
    failedToGetCompleteNewPasswordChallengeMethodError,
    failedToGetRefreshTokenMethodError,
    failedToGetAuthenticateUserMethodError,
    failedToGetIdTokenError,
    failedToGetIdTokenMethodError,
    failedToRefreshTokenError,
    failedToGetAuthenticationDetailsError,
    refreshTokenSafe,
    refresh,
    getTokens,
    constructAuthenticationData,
    constructCognitoUserObject,
    createTokensObject,
    extractTokenMethods,
    authenticateUserSafe,
    authenticate,
    authenticateUser: authenticateUserSafe(
        authData => new cognitosdk.AuthenticationDetails(authData),
        cognitoUserData => new cognitosdk.CognitoUser(cognitoUserData)
    ),
    refreshToken: refreshTokenSafe(
        data => new this.cognitosdk.CognitoRefreshToken(data),
        cognitoUserData => new cognitosdk.CognitoUser(cognitoUserData)
    )
}



// class CognitoConnector {
//     constructor(cognitosdk) {
//         this.cognitosdk = cognitosdk
//         const poolData = {
//             UserPoolId: process.env.COGNITO_USER_POOL || "", 
//             ClientId: process.env.COGNITO_USER_POOL_CLIENT || ""
//         };
//         this._userPool = new this.cognitosdk.CognitoUserPool(poolData);
//     }

//     async authenticateUser(user, password) {
//         if(!user || !password) {
//             return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
//         }
//         // 1. Generate an AuthenticationDetails object
//         const authenticationData = {
//             Username: user,
//             Password: password
//         };
//         const authenticationDetails =
//             new this.cognitosdk.AuthenticationDetails(authenticationData);

//         // 2. Generate a CognitoUser object
//         const userData = {
//             Username: user,
//             Pool: this._userPool
//         };
//         const cognitoUser = new this.cognitosdk.CognitoUser(userData);

//         // 3. Invoke the authenticate method
//         return this.authenticate(cognitoUser, authenticationDetails);
//     }

//     async refreshToken(user, token) {
//         if(!user || !token) {
//             return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
//         }
//         // 1. Generate a CognitoUser object
//         const userData = {
//             Username: user,
//             Pool: this._userPool
//         };
//         const cognitoUser = new this.cognitosdk.CognitoUser(userData);

//         // 2. Generate a RefreshToken object
//         const refreshToken = new this.cognitosdk.CognitoRefreshToken({RefreshToken: token});
//         // console.log(refreshToken);
//         // console.log(refreshToken.getToken());

//         // 3. Invoke the refresh method
//         return this.refresh(cognitoUser, refreshToken);
//     }

//     refresh(cognitoUser, token) {
//         if(!cognitoUser || !token) {
//             return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
//         }
//         return new Promise((resolve, reject) => {
//             cognitoUser.refreshSession(token, (err, session) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(this.getTokens(session));
//                 }
//             });
//         });
//     };

//     getTokens(authResult) {
//         if(
//            !authResult || !authResult.getAccessToken || 
//            !authResult.getRefreshToken || 
//            !authResult.getIdToken) {
//             throw new Error("PROVIDED_ARGUMENTS_ARE_INVALID")
//         }
//         const accessToken = authResult.getAccessToken().getJwtToken();
//         const refreshToken = authResult.getRefreshToken().getToken();
//         const tokenId = authResult.getIdToken().getJwtToken();
    
//         return {
//             accessToken,
//             refreshToken,
//             tokenId
//         };
//     };

//     authenticate(cognitoUser, authenticationDetails) {
//         if(!cognitoUser || !authenticationDetails) {
//             return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
//         }
//         return new Promise((resolve, reject) => {
//             cognitoUser.authenticateUser(authenticationDetails, {
//                 onSuccess: (result) => {
//                     // Authenticate a user section
//                     resolve(this.getTokens(result));
//                 },
//                 newPasswordRequired: async function (userAttributes, requiredAttributes) {

//                     delete userAttributes.email_verified;
//                     delete userAttributes.phone_number_verified;

//                     cognitoUser.completeNewPasswordChallenge(
//                         authenticationDetails.getPassword(),
//                         userAttributes,
//                         this
//                     );
//                     resolve()
                    
//                 },
//                 onFailure: (error) => {
//                     reject(error);
//                 }
//             });
//         });
//     };
// }

