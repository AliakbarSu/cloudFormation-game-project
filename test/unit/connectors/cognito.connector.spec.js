const {
    failedToAuthenticateUserError,
    failedToGetAccessTokenError,
    failedToGetAccesTokenMethodError,
    failedToGetCognitoUserError,
    failedToGetCompleteNewPasswordChallengeMethodError,
    failedToGetRefreshTokenMethodError,
    failedToGetAuthenticateUserMethodError,
    failedToGetIdTokenError,
    failedToGetIdTokenMethodError,
    failedToGetAuthenticationDetailsError,
    failedToGetRefreshTokenError,
    failedToGetgetTokenMethodError,
    failedToRefreshTokenError,
    failedTogetRefreshSessionMethodError,
    invalidRefreshSessionMethodError,
    refreshTokenSafe,
    getTokens,
    refresh,
    constructAuthenticationData,
    constructCognitoUserObject,
    createTokensObject,
    extractTokenMethods,
    authenticateUserSafe,
    authenticate
} = require('../../../src/opt/nodejs/connectors/cognito.connector')

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)



describe("Cognito Connector", function() {
    let getAuthenticationDetailsStub, getCognitoUserStub,
    onSuccessStub, newPasswordRequireStub, onFailureStub,
    mockUsername, mockPassword, mockUserPool, mockTokenId, mockAccessToken,
    mockRefreshToken, mockError, mockResult, mockGetAccessToken,
    mockGetRefreshToken, mockGetIdToken, authenticateUserStub,
    completeNewPasswordChallengeStub

    this.beforeEach(() => {
        mockUsername = "test_username"
        mockPassword = "test_password"
        mockUserPool = "test_user_pool"
        mockTokenId = "test_token_id"
        mockAccessToken = "test_access_token"
        mockRefreshToken = "test_refresh_token"
        mockGetAccessToken = fake.returns({getJwtToken: () => mockAccessToken})
        mockGetRefreshToken = fake.returns({getToken: () => mockRefreshToken})
        mockGetIdToken = fake.returns({getJwtToken: () => mockTokenId})
        mockResult = {
            getAccessToken: mockGetAccessToken,
            getRefreshToken: mockGetRefreshToken,
            getIdToken: mockGetIdToken
        }
        mockError = new Error("test_error")
        onFailureStub = fake.returns(mockError)
        getAuthenticationDetailsStub = fake.returns("test")
        authenticateUserStub = (authDetails, obj) => {
            obj.onSuccess(mockResult)
        }
        completeNewPasswordChallengeStub = fake.returns()
        getCognitoUserStub = fake.returns({
            authenticateUser: authenticateUserStub,
            completeNewPasswordChallenge: completeNewPasswordChallengeStub
        })
    })

    describe("invalidRefreshSessionMethodError", function() {
        it("Should create a new error object", () => {
            expect(invalidRefreshSessionMethodError().message)
            .to.equal("INVALID_REFRESH_SESSION_METHOD_PROVIDED")
        })
    })

    describe("failedTogetRefreshSessionMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedTogetRefreshSessionMethodError().message)
            .to.equal("FAILED_TO_GET_REFRESH_SESSION_METHOD")
        })
    })

    describe("failedToRefreshTokenError", function() {
        it("Should create a new error object", () => {
            expect(failedToRefreshTokenError().message)
            .to.equal("FAILED_TO_REFRESH_TOKEN")
        })
    })

    describe("failedToGetgetTokenMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetgetTokenMethodError().message)
            .to.equal("FAILED_TO_GET_GET_TOKEN_METHOD")
        })
    })

    describe("failedToAuthenticateUserError", function() {
        it("Should create a new error object", () => {
            expect(failedToAuthenticateUserError().message)
            .to.equal("FAILED_TO_AUTHENTICATE_USER")
        })
    })

    describe("failedToGetAccessTokenError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetAccessTokenError().message)
            .to.equal("FAILED_TO_GET_ACCESS_TOKEN")
        })
    })

    describe("failedToGetRefreshTokenError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetRefreshTokenError().message)
            .to.equal("FAILED_TO_GET_REFRESH_TOKEN_TOKEN")
        })
    })

    describe("failedToGetIdTokenError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetIdTokenError().message)
            .to.equal("FAILED_TO_GET_ID_TOKEN")
        })
    })

    describe("failedToGetAccesTokenMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetAccesTokenMethodError().message)
            .to.equal("FAILED_TO_GET_ACCESS_TOKEN_METHOD")
        })
    })

    describe("failedToGetRefreshTokenMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetRefreshTokenMethodError().message)
            .to.equal("FAILED_TO_GET_REFRESH_TOKEN_METHOD")
        })
    })

    describe("failedToGetIdTokenMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetIdTokenMethodError().message)
            .to.equal("FAILED_TO_GET_ID_TOKEN_METHOD")
        })
    })

    describe("failedToGetAuthenticationDetailsError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetAuthenticationDetailsError().message)
            .to.equal("FAILED_TO_GET_AUTHENTICATION_DETAILS")
        })
    })

    describe("failedToGetCognitoUserError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetCognitoUserError().message)
            .to.equal("FAILED_TO_GET_COGNITO_USER")
        })
    })

    describe("failedToGetAuthenticateUserMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetAuthenticateUserMethodError().message)
            .to.equal("FAILED_TO_GET_AUTHENTICATE_USER_METHOD")
        })
    })

    describe("failedToGetCompleteNewPasswordChallengeMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetCompleteNewPasswordChallengeMethodError().message)
            .to.equal("FAILED_TO_GET_COMPLETE_NEW_PASSWORD_CHALLENGE_METHOD")
        })
    })

    describe("createTokensObject", function() {
        it("Should create an object containing three types of tokens", () => {
            const result = createTokensObject(mockAccessToken, mockRefreshToken, mockTokenId)
            expect(result.accessToken).to.equal(mockAccessToken)
            expect(result.refreshToken).to.equal(mockRefreshToken)
            expect(result.tokenId).to.equal(mockTokenId)
        })
    })

    describe("constructCognitoUserObject", function() {
        it("Should resolve to an object containing username and pool", async () => {
            const result = await constructCognitoUserObject(mockUsername, mockUserPool)
            expect(result.Username).to.equal(mockUsername)
            expect(result.Pool).to.equal(mockUserPool)
        })

        it("Should reject if username is invalid", (done) => {
            mockUsername = ""
            constructCognitoUserObject(mockUsername, mockUserPool)
            .catch(err => {
                expect(err.message).to.equal("INVALID_USERNAME_PROVIDED")
                done()
            })
        })

        it("Should reject if userPool is invalid", (done) => {
            mockUserPool = ""
            constructCognitoUserObject(mockUsername, mockUserPool)
            .catch(err => {
                expect(err.message).to.equal("INVALID_USER_POOL_PROVIDED")
                done()
            })
        })
    })

    describe("constructAuthenticationData", function() {
        it("Should resolve to an object containing username and password", async () => {
            const result = await constructAuthenticationData(mockUsername, mockPassword)
            expect(result.Username).to.equal(mockUsername)
            expect(result.Password).to.equal(mockPassword)
        })

        it("Should reject if username is invalid", (done) => {
            mockUsername = ""
            constructAuthenticationData(mockUsername, mockUserPool)
            .catch(err => {
                expect(err.message).to.equal("INVALID_USERNAME_PROVIDED")
                done()
            })
        })

        it("Should reject if userPool is invalid", (done) => {
            mockPassword = ""
            constructAuthenticationData(mockUsername, mockPassword)
            .catch(err => {
                expect(err.message).to.equal("INVALID_PASSWORD_PROVIDED")
                done()
            })
        })
    })


    describe("extractTokenMethods", function() {
        it("Should reject if getAccessToken is invalid", (done) => {
            mockResult.getAccessToken = null
            extractTokenMethods(mockResult)
            .catch(err => {
                expect(err.message).to.equal("FAILED_TO_GET_ACCESS_TOKEN_METHOD")
                done()
            })
        })

        it("Should reject if getRefreshToken is invalid", (done) => {
            mockResult.getRefreshToken = null
            extractTokenMethods(mockResult)
            .catch(err => {
                expect(err.message).to.equal("FAILED_TO_GET_REFRESH_TOKEN_METHOD")
                done()
            })
        })

        it("Should reject if getIdToken is invalid", (done) => {
            mockResult.getIdToken = null
            extractTokenMethods(mockResult)
            .catch(err => {
                expect(err.message).to.equal("FAILED_TO_GET_ID_TOKEN_METHOD")
                done()
            })
        })

        it("Should resolve to an object containing three methods", (done) => {
            extractTokenMethods(mockResult)
            .then(data => {
                expect(data.accessToken.getJwtToken()).to.equal(mockAccessToken)
                expect(data.refreshToken.getToken()).to.equal(mockRefreshToken)
                expect(data.idToken.getJwtToken()).to.equal(mockTokenId)
                done()
            })
            
        })
    })

    describe("authenticateUserSafe", function() {
        it("Should resolve to an object containing three types of tokens", async () => {
            
            const tokens =  await authenticateUserSafe(
                getAuthenticationDetailsStub,
                getCognitoUserStub,
                mockUserPool, 
                mockUsername, 
                mockPassword)

            expect(tokens.accessToken).to.equal(mockAccessToken)
            expect(tokens.refreshToken).to.equal(mockRefreshToken)
            expect(tokens.tokenId).to.equal(mockTokenId)
           
        })

        it("Should reject if getAuthenticationDetails returns null or undefined", async () => {
            getAuthenticationDetailsStub = fake.returns(null)
            try {
                await authenticateUserSafe(
                    getAuthenticationDetailsStub,
                    getCognitoUserStub,
                    mockUserPool, 
                    mockUsername, 
                    mockPassword)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_AUTHENTICATION_DETAILS")
            }
        })

        it("Should reject if getCognitoUser returns null or undefined", async () => {
            getCognitoUserStub = fake.returns(null)
            try {
                await authenticateUserSafe(
                    getAuthenticationDetailsStub,
                    getCognitoUserStub,
                    mockUserPool, 
                    mockUsername, 
                    mockPassword)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_COGNITO_USER")
            }
        })

        it("Should reject if authenticateUser is invalid", async () => {
            getCognitoUserStub = fake.returns({
                authenticateUser: null,
                completeNewPasswordChallenge: completeNewPasswordChallengeStub
            })
            try {
                await authenticateUserSafe(
                    getAuthenticationDetailsStub,
                    getCognitoUserStub,
                    mockUserPool, 
                    mockUsername, 
                    mockPassword)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_AUTHENTICATE_USER_METHOD")
            }
        })

        it("Should reject if completeNewPasswordChallenge is invalid", async () => {
            getCognitoUserStub = fake.returns({
                authenticateUser: authenticateUserStub,
                completeNewPasswordChallenge: null
            })
            try {
                await authenticateUserSafe(
                    getAuthenticationDetailsStub,
                    getCognitoUserStub,
                    mockUserPool, 
                    mockUsername, 
                    mockPassword)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_COMPLETE_NEW_PASSWORD_CHALLENGE_METHOD")
            }
        })

        it("Should reject if authenticateUser fails", async () => {
            const testError = new Error("test_error")
            authenticateUserStub = (authDetails, obj) => {
                obj.onFailure(testError)
            }
            getCognitoUserStub = fake.returns({
                authenticateUser: authenticateUserStub,
                completeNewPasswordChallenge: completeNewPasswordChallengeStub
            })
            try {
                await authenticateUserSafe(
                    getAuthenticationDetailsStub,
                    getCognitoUserStub,
                    mockUserPool, 
                    mockUsername, 
                    mockPassword)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err).to.deep.equal(testError)
            }
        })

        it("Should reject if authenticating user fails", async () => {
            const testError = new Error("test_error")
            getCognitoUserStub = () => {throw testError}
            try {
                await authenticateUserSafe(
                    getAuthenticationDetailsStub,
                    getCognitoUserStub,
                    mockUserPool, 
                    mockUsername, 
                    mockPassword)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.deep.equal("FAILED_TO_AUTHENTICATE_USER")
            }
        })
        // Revisit
        // it("Should reject if completeNewPasswordChallenge fails", async () => {
        //     completeNewPasswordChallengeStub = fake.reject()
        //     try {
        //         await authenticateUserSafe(
        //             getAuthenticationDetailsStub,
        //             getCognitoUserStub,
        //             mockUserPool, 
        //             mockUsername, 
        //             mockPassword)
        //         throw new Error("FALSE_PASS")
        //     }catch(err) {
        //         expect(err.message).to.equal("FAILED_TO_AUTHENTICATE_USER")
        //     }
        // })
        // completeNewPasswordChallenge success case
        // it("Should reject if completeNewPasswordChallenge fails", async () => {
        //     completeNewPasswordChallengeStub = fake.reject()
        //     try {
        //         await authenticateUserSafe(
        //             getAuthenticationDetailsStub,
        //             getCognitoUserStub,
        //             mockUserPool, 
        //             mockUsername, 
        //             mockPassword)
        //         throw new Error("FALSE_PASS")
        //     }catch(err) {
        //         expect(err.message).to.equal("FAILED_TO_AUTHENTICATE_USER")
        //     }
        // })
    })

    describe("authenticate", function() {
        it("Should reject if onSuccess fails", async () => {
            const authDetailsStub = fake.returns()
            mockResult = {
                getAccessToken: null
            }
            try {
                await authenticate(
                    authenticateUserStub,
                    completeNewPasswordChallengeStub,
                    authDetailsStub
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_ACCESS_TOKEN_METHOD")
            }
        })
    })


    describe("Refresh autnetication token", function() {
        let _refreshSessionStub, getCognitoRefreshTokenStub, refreshTokenStub

        this.beforeEach(() => {
            getCognitoRefreshTokenStub = mockGetRefreshToken
            _refreshSessionStub = fake.yields(null, mockResult)
            getCognitoUserStub = fake.returns({
                refreshSession: _refreshSessionStub,
                refreshToken: mockTokenId
            })
        })

        describe("refresh", function() {
            it("Should reject if _refreshSession is not valid", async () => {
                try {
                    await refresh(null, mockTokenId)     
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("INVALID_REFRESH_SESSION_METHOD_PROVIDED")
                }
            })
            it("Should reject if token is invalid", async () => {
                try {
                    await refresh(_refreshSessionStub, null)
                }catch(err) {
                    expect(err.message).to.equal("INVALID_TOKEN_PROVIDED")
                }
            })
            it("Should reject if _refreshSession fails", async () => {
                const error = new Error("test_error")
                _refreshSessionStub = fake.yields(error)
                try {
                    await refresh(_refreshSessionStub, mockTokenId)
                }catch(err) {
                    expect(err.message).to.equal(error.message)
                }
            })

            it("Should resolve to an object containing three types of tokens", async () => {
                const tokens =  await refresh(_refreshSessionStub, mockTokenId)
                expect(tokens.accessToken).to.equal(mockAccessToken)
                expect(tokens.refreshToken).to.equal(mockRefreshToken)
                expect(tokens.tokenId).to.equal(mockTokenId)
                expect(_refreshSessionStub.getCall(0).args[0]).to.equal(mockTokenId)
            })
        })

        describe("refreshTokenSafe", function() {
            it("Should reject if username is invalid", async () => {
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        "",
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("INVALID_USERNAME_PROVIDED")
                }
            })

            it("Should reject if token is invalid", async () => {
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        mockUsername,
                        "")
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("INVALID_TOKEN_PROVIDED")
                }
            })

            it("Should reject if userPool is invalid", async () => {
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        "",
                        mockUsername,
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("INVALID_USER_POOL_PROVIDED")
                }
            })

            it("Should reject if if getCognitoRefreshToken fails", async () => {
                getCognitoRefreshTokenStub = fake.returns(null)
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        mockUsername,
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("FAILED_TO_GET_REFRESH_TOKEN_TOKEN")
                    expect(getCognitoRefreshTokenStub.calledOnce).to.be.true
                    expect(getCognitoRefreshTokenStub.getCall(0).args[0].RefreshToken).to.equal(mockTokenId)
                }
            })

            it("Should reject if if getCognitoUser fails", async () => {
                getCognitoUserStub = fake.returns(null)
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        mockUsername,
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("FAILED_TO_GET_COGNITO_USER")
                    expect(getCognitoUserStub.calledOnce).to.be.true
                    expect(getCognitoUserStub.getCall(0).args[0].Username).to.equal(mockUsername)
                }
            })

            it("Should reject if refreshToken is undefined or null", async () => {
                getCognitoUserStub = fake.returns({
                    refreshSession: _refreshSessionStub,
                    refreshToken: null
                })
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        mockUsername,
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("FAILED_TO_GET_REFRESH_TOKEN_METHOD")
                }
            })

            it("Should reject if refreshSession is undefined or null", async () => {
                getCognitoUserStub = fake.returns({
                    refreshSession: null,
                    refreshToken: mockTokenId
                })
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        mockUsername,
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("FAILED_TO_GET_REFRESH_SESSION_METHOD")
                }
            })

            it("Should reject if getToken is undefined or null", async () => {

                getCognitoRefreshTokenStub = fake.returns({getToken: null})
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        mockUsername,
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("FAILED_TO_GET_GET_TOKEN_METHOD")
                }
            })

            it("Should invoke getToken", async () => {
                const getTokenStub = fake.returns("test")
                getCognitoRefreshTokenStub = fake.returns({getToken: getTokenStub})
                try {
                    await refreshTokenSafe(
                            getCognitoRefreshTokenStub, 
                            getCognitoUserStub,
                            mockUserPool,
                            mockUsername,
                            mockTokenId)
                    expect(getTokenStub.calledOnce).to.be.true
                }catch(err) {
                    expect(err.message).to.equal("FAILED")
                }
            })

            it("Should reject if refreshing token fails", async () => {
                const error = new Error("test_error")
                getCognitoRefreshTokenStub = fake.returns({getToken: () => {throw error}})
                try {
                    await refreshTokenSafe(
                        getCognitoRefreshTokenStub, 
                        getCognitoUserStub,
                        mockUserPool,
                        mockUsername,
                        mockTokenId)
                    throw new Error("FALSE_PASS")
                }catch(err) {
                    expect(err.message).to.equal("FAILED_TO_REFRESH_TOKEN")
                }
            })

            it("Should resolve to an object containing three types of tokens if everyting went well", async () => {
                const tokens =  await refreshTokenSafe(
                    getCognitoRefreshTokenStub, 
                    getCognitoUserStub,
                    mockUserPool,
                    mockUsername,
                    mockTokenId)
                expect(tokens.accessToken).to.equal(mockAccessToken)
                expect(tokens.refreshToken).to.equal(mockRefreshToken)
                expect(tokens.tokenId).to.equal(mockTokenId)
                expect(_refreshSessionStub.getCall(0).args[0]).to.equal(mockTokenId)
            })
        })
    })

    describe("getTokens", function() {
        let getAccessToken, getRefreshToken, getIdToken

        this.beforeEach(() => {
            getAccessToken = fake.returns(mockAccessToken)
            getRefreshToken = fake.returns(mockRefreshToken)
            getIdToken = fake.returns(mockTokenId)
        })

        it("Should reject if accessToken is null or undefined", async () => {
            getAccessToken = fake.returns(null)
            try {
                await getTokens(
                    getAccessToken, 
                    getRefreshToken, 
                    getIdToken)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_ACCESS_TOKEN")
            }
        })

        it("Should reject if refreshToken is null or undefined", async () => {
            getRefreshToken = fake.returns(null)
            try {
                await getTokens(
                    getAccessToken, 
                    getRefreshToken, 
                    getIdToken)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_REFRESH_TOKEN_TOKEN")
            }
        })

        it("Should reject if tokenId is null or undefined", async () => {
            getIdToken = fake.returns(null)
            try {
                await getTokens(
                    getAccessToken, 
                    getRefreshToken, 
                    getIdToken)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_ID_TOKEN")
            }
        })


        it("Should resolve to an object containing three types of tokens if everyting went well", async () => {
            const tokens =  await getTokens(
                getAccessToken, 
                getRefreshToken, 
                getIdToken)
            expect(tokens.accessToken).to.equal(mockAccessToken)
            expect(tokens.refreshToken).to.equal(mockRefreshToken)
            expect(tokens.tokenId).to.equal(mockTokenId)
        })
    })

})