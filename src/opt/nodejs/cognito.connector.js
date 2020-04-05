'use strict';
const cognitosdk = require('amazon-cognito-identity-js');
const CONSTANTS = require('./constants');



class CognitoConnector {
    constructor(deps) {
        this.deps = deps
        const poolData = {
            UserPoolId: this.deps.CONSTANTS.COGNITO_USER_POOL,
            ClientId: this.deps.CONSTANTS.COGNITO_USER_POOL_CLIENT
        };
        this._userPool = new this.deps.cognitosdk.CognitoUserPool(poolData);
    }

    async authenticateUser(user, password) {
        if(!user || !password) {
            return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
        }
        // 1. Generate an AuthenticationDetails object
        const authenticationData = {
            Username: user,
            Password: password
        };
        const authenticationDetails =
            new this.deps.cognitosdk.AuthenticationDetails(authenticationData);

        // 2. Generate a CognitoUser object
        const userData = {
            Username: user,
            Pool: this._userPool
        };
        const cognitoUser = new this.deps.cognitosdk.CognitoUser(userData);

        // 3. Invoke the authenticate method
        return this.authenticate(cognitoUser, authenticationDetails);
    }

    async refreshToken(user, token) {
        if(!user || !token) {
            return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
        }
        // 1. Generate a CognitoUser object
        const userData = {
            Username: user,
            Pool: this._userPool
        };
        const cognitoUser = new this.deps.cognitosdk.CognitoUser(userData);

        // 2. Generate a RefreshToken object
        const refreshToken = new this.deps.cognitosdk.CognitoRefreshToken({RefreshToken: token});
        console.log(refreshToken);
        console.log(refreshToken.getToken());

        // 3. Invoke the refresh method
        return this.refresh(cognitoUser, refreshToken);
    }

    refresh(cognitoUser, token) {
        if(!cognitoUser || !token) {
            return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
        }
        return new Promise((resolve, reject) => {
            cognitoUser.refreshSession(token, (err, session) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.getTokens(session));
                }
            });
        });
    };

    getTokens(authResult) {
        if(
           !authResult || !authResult.getAccessToken || 
           !authResult.getRefreshToken || 
           !authResult.getIdToken) {
            throw new Error("PROVIDED_ARGUMENTS_ARE_INVALID")
        }
        const accessToken = authResult.getAccessToken().getJwtToken();
        const refreshToken = authResult.getRefreshToken().getToken();
        const tokenId = authResult.getIdToken().getJwtToken();
    
        return {
            accessToken,
            refreshToken,
            tokenId
        };
    };

    authenticate(cognitoUser, authenticationDetails) {
        if(!cognitoUser || !authenticationDetails) {
            return Promise.reject(new Error("PROVIDED_ARGUMENTS_ARE_INVALID"))
        }
        return new Promise((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    // Authenticate a user section
                    resolve(this.getTokens(result));
                },
                newPasswordRequired: async function (userAttributes, requiredAttributes) {

                    delete userAttributes.email_verified;
                    delete userAttributes.phone_number_verified;

                    cognitoUser.completeNewPasswordChallenge(
                        authenticationDetails.getPassword(),
                        userAttributes,
                        this
                    );
                    resolve()
                    
                },
                onFailure: (error) => {
                    reject(error);
                }
            });
        });
    };
}


exports.CognitoConnector = CognitoConnector
exports.cognitoConnector = new CognitoConnector({
    CONSTANTS,
    cognitosdk
})