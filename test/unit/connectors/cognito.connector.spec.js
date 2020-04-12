// let layerPath = "../../../src/opt/nodejs/";
// if(!process.env['DEV']) {
//     layerPath = "/opt/nodejs/"
// }


// const cognitoConnector = require(layerPath + 'cognito.connector')
// const CONSTANTS = require(layerPath + 'constants')
// const AWS = require('aws-sdk')
// const chai = require('chai')
// const expect = chai.expect
// const cognitosdk = require('amazon-cognito-identity-js');
// const sinon = require("sinon")


// xdescribe("Cognito Connector", function() {

//     let deps, cognitoConnectorObj;
//     let cognitoUserPoolStub, cognitoUserStub;
//     const testPool = "TEST_POOL"


//     deps = {
//         CONSTANTS,
//         cognitosdk
//     }

//     this.beforeAll(() => {
//         cognitoUserPoolStub = sinon.stub(cognitosdk, "CognitoUserPool").returns(testPool)
//         cognitoConnectorObj = new cognitoConnector.CognitoConnector(deps)
//         cognitoUserStub = sinon.stub(cognitosdk, "CognitoUser").returns("fksfj")
//     })

//     this.beforeEach(() => {
//         cognitoUserPoolStub.resetHistory()
//         cognitoUserStub.resetHistory()
//     })

//     this.afterAll(() => {
//         cognitoUserStub.restore()
//     })

//     describe("Create User Pool", function() {
//         let UserPoolId, ClientId;

//         this.beforeAll(() => {
//             UserPoolId = "TEST_POOL_ID"
//             ClientId = "TEST_CLIENT_ID"
//         })

//         it("Should call CognitoUserPool method", () => {
//             CONSTANTS.COGNITO_USER_POOL = UserPoolId
//             CONSTANTS.COGNITO_USER_POOL_CLIENT = ClientId
//             cognitoConnectorObj = new cognitoConnector.CognitoConnector(deps)
//             expect(cognitoUserPoolStub.calledOnce).to.be.true
//             expect(cognitoUserPoolStub.getCall(0).args[0].UserPoolId).to.equal(UserPoolId)
//             expect(cognitoUserPoolStub.getCall(0).args[0].ClientId).to.equal(ClientId)
//         })
//     })

//     describe("authenticateUser", function() {
//         let testAuthenticationDetails
//         let AuthenticationDetailsStub
//         let testUsername = "TEST_USERNAME"
//         let testPassword = "TEST_PASSWORD"


//         this.beforeAll(() => {
//             testAuthenticationDetails = {token: "TEST_TOKEN"}
//             AuthenticationDetailsStub = sinon.stub(cognitosdk, "AuthenticationDetails").returns("jksjf")
//         })

//         this.beforeEach(() => {
//             AuthenticationDetailsStub.resetHistory()
//         })

//         this.afterAll(() => {
//             AuthenticationDetailsStub.restore()
//         })

//         it("Should throw error if username or password is invalid or missing", async () => {
//             try {
//                 await cognitoConnectorObj.authenticateUser(null, testPassword)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }

//             try {
//                 await cognitoConnectorObj.authenticateUser(testUsername, null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }
//         })

//         it("Should call AuthenticationDetails and pass username and password", async () => {
//             const authenticateStub = sinon.stub(cognitoConnectorObj, "authenticate").resolves()
//             await cognitoConnectorObj.authenticateUser(testUsername, testPassword)
//             expect(AuthenticationDetailsStub.calledOnce).to.be.true
//             expect(AuthenticationDetailsStub.getCall(0).args[0].Username).to.equal(testUsername)
//             expect(AuthenticationDetailsStub.getCall(0).args[0].Password).to.equal(testPassword)
//             authenticateStub.restore()
//         })

//         it("Should call CognitoUser and pass correct args", async () => {
//             const authenticateStub = sinon.stub(cognitoConnectorObj, "authenticate").resolves()
//             await cognitoConnectorObj.authenticateUser(testUsername, testPassword)
//             expect(cognitoUserStub.calledOnce).to.be.true
//             expect(cognitoUserStub.getCall(0).args[0].Username).to.equal(testUsername)
//             expect(cognitoUserStub.getCall(0).args[0].Pool).to.equal(cognitoConnectorObj._userPool)
//             authenticateStub.restore()
//         })

//         it("Should call authenticate method and pass cognitoUser and authenticationDetails", async () => {
//             const testCognitoUser = "TEST_COGNITO_USER"
//             const testAuthenticationDetails = "TEST_AUTH_DETAILS"

//             AuthenticationDetailsStub.returns({testAuthenticationDetails})
//             cognitoUserStub.returns({testCognitoUser})
//             const authenticateStub = sinon.stub(cognitoConnectorObj, "authenticate").resolves()

//             await cognitoConnectorObj.authenticateUser(testUsername, testPassword)

//             expect(authenticateStub.calledOnce).to.be.true
//             expect(authenticateStub.getCall(0).args[0].testCognitoUser).to.equal(testCognitoUser)
//             expect(authenticateStub.getCall(0).args[1].testAuthenticationDetails).to.equal(testAuthenticationDetails)
//             authenticateStub.restore()
//         })
//     })

//     describe("refreshToken", function() {
//         let testToken = "TEST_TOKEN"
//         let cognitoRefreshTokenStub;
//         let testUsername = "TEST_USERNAME"

//         this.beforeAll(() => {
//             cognitoRefreshTokenStub = sinon.stub(cognitosdk, "CognitoRefreshToken").returns({getToken: () => testToken})
//         })

//         this.beforeEach(() => {
//             cognitoRefreshTokenStub.resetHistory()
//         })

//         this.afterAll(() => {
//             cognitoRefreshTokenStub.restore()
//         })

//         it("Should throw error if username or token is invalid or missing", async () => {
//             try {
//                 await cognitoConnectorObj.refreshToken(null, testToken)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }

//             try {
//                 await cognitoConnectorObj.refreshToken(testUsername, null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }
//         })

//         it("Should call CognitoUser and pass correct args", async () => {
//             const refreshStub = sinon.stub(cognitoConnectorObj, "refresh").resolves()
//             await cognitoConnectorObj.refreshToken(testUsername, testToken)
//             expect(cognitoUserStub.calledOnce).to.be.true
//             expect(cognitoUserStub.getCall(0).args[0].Username).to.equal(testUsername)
//             expect(cognitoUserStub.getCall(0).args[0].Pool).to.equal(cognitoConnectorObj._userPool)
//             refreshStub.restore()
//         })

//         it("Should call CognitoRefreshToken and pass username and password", async () => {
//             const refreshStub = sinon.stub(cognitoConnectorObj, "refresh").resolves()
//             await cognitoConnectorObj.refreshToken(testUsername, testToken)
//             expect(cognitoRefreshTokenStub.calledOnce).to.be.true
//             expect(cognitoRefreshTokenStub.getCall(0).args[0].RefreshToken).to.equal(testToken)
//             refreshStub.restore()
//         })

//         it("Should call refresh method and pass cognitoUser and refreshToken", async () => {
//             const testCognitoUser = "TEST_COGNITO_USER"

//             cognitoUserStub.returns({testCognitoUser})
//             const refreshStub = sinon.stub(cognitoConnectorObj, "refresh").resolves()

//             await cognitoConnectorObj.refreshToken(testUsername, testToken)

//             expect(refreshStub.calledOnce).to.be.true
//             expect(refreshStub.getCall(0).args[0].testCognitoUser).to.equal(testCognitoUser)
//             expect(refreshStub.getCall(0).args[1].getToken()).to.equal(testToken)
//             refreshStub.restore()
//         })
//     })

//     describe("refresh", function() {
//         let getTokensStub;
//         let testToken = "TEST_TOKEN"
//         const testCognitoUser = {
//             refreshSession: sinon.fake.yields(null, {})
//         }

//         this.beforeAll(() => {
//             getTokensStub = sinon.stub(cognitoConnectorObj, "getTokens").returns()
//         })

//         this.beforeEach(() => {
//             getTokensStub.resetHistory()
//         })

//         this.afterAll(() => {
//             getTokensStub.restore()
//         })

//         it("Should throw error if cognitoUser or token is invalid or missing", async () => {
//             try {
//                 await cognitoConnectorObj.refresh(null, testToken)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }

//             try {
//                 await cognitoConnectorObj.refresh(testCognitoUser, null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }
//         })

//         it("Should call refreshSession and pass token", async () => {
//             await cognitoConnectorObj.refresh(testCognitoUser, testToken)
//             expect(testCognitoUser.refreshSession.calledOnce).to.be.true
//             expect(testCognitoUser.refreshSession.getCall(0).args[0]).to.equal(testToken)
//         })

//         it("Should call getTokens and pass session", async () => {
//             const testSession = "TEST_SESSION"
//             testCognitoUser.refreshSession = sinon.fake.yields(null, testSession)

//             await cognitoConnectorObj.refresh(testCognitoUser, testToken)
            
//             expect(getTokensStub.calledOnce).to.be.true
//             expect(getTokensStub.getCall(0).args[0]).to.equal(testSession)
//         })

//         it("Should throw error when refreshSession fails", async () => {
//             const error = new Error("TEST_ERROR")
//             testCognitoUser.refreshSession = sinon.fake.yields(error, null)

//             try {
//                 await cognitoConnectorObj.refresh(testCognitoUser, testToken)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal(error.message)
//             }
//         })
//     })

//     describe("getTokens", function() {
//         let getJwtToken, getToken, getAccessToken, getRefreshToken, getIdToken;
//         let testToken = "TEST_TOKEN"
//         let authResults = {}

//         this.beforeAll(() => {
//             getJwtToken = sinon.fake.returns(testToken)
//             getAccessToken = sinon.fake.returns({getJwtToken})
//             getToken = sinon.fake.returns(testToken)
//             getRefreshToken = sinon.fake.returns({getToken})
//             getIdToken = sinon.fake.returns({getJwtToken})
//         })

//         this.beforeEach(() => {
//             getJwtToken.resetHistory()
//             getAccessToken.resetHistory()
//             getToken.resetHistory()
//             getIdToken.resetHistory()
//             getRefreshToken.resetHistory()

//             authResults.getAccessToken = getAccessToken
//             authResults.getRefreshToken = getRefreshToken
//             authResults.getIdToken = getIdToken
//         })

//         it("Should throw error if authResult is invalid or missing", async () => {
//             try {
//                 cognitoConnectorObj.getTokens(null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }

//             try {
//                 cognitoConnectorObj.getTokens({})
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }
//         })

//         it("Should call authResult.getAccessToken()", () => {
//             cognitoConnectorObj.getTokens(authResults)
//             expect(authResults.getAccessToken.calledOnce).to.be.true
//         })

//         it("Should call authResult.getAccessToken().getJwtToken()", () => {
//             cognitoConnectorObj.getTokens(authResults)
//             expect(getJwtToken.callCount).to.equal(2)
//         })

//         it("Should call authResult.getRefreshToken()", () => {
//             cognitoConnectorObj.getTokens(authResults)
//             expect(authResults.getRefreshToken.calledOnce).to.be.true
//         })

//         it("Should call authResult.getRefreshToken().getToken()", () => {
//             cognitoConnectorObj.getTokens(authResults)
//             expect(getToken.calledOnce).to.be.true
//         })

//         it("Should call authResult.getIdToken()", () => {
//             cognitoConnectorObj.getTokens(authResults)
//             expect(authResults.getIdToken.calledOnce).to.be.true
//         })

//         it("Should call authResult.getIdToken().getJwtToken()", () => {
//             cognitoConnectorObj.getTokens(authResults)
//             expect(getJwtToken.callCount).to.equal(2)
//         })

//         it("Should return correct data", () => {
//             const expectedData = {
//                 accessToken: testToken,
//                 refreshToken: testToken,
//                 tokenId: testToken
//             }
//             const result = cognitoConnectorObj.getTokens(authResults)
//             expect(result).to.deep.equal(expectedData)
//         })
//     })

//     describe("authenticate", function() {

//         const testCognitoUser = {
//             authenticateUser: sinon.stub().callsFake((authDetails, callbacks) => callbacks.onSuccess(true)),
//             completeNewPasswordChallenge: sinon.fake.returns()
//         }
//         const testAuthenticationDetails = {
//             getPassword: sinon.stub().returns("TEST_PASSWORD")
//         }

//         it("Should throw error if cognitoUser or authenticationDetails is invalid or missing", async () => {
//             try {
//                 await cognitoConnectorObj.authenticate(null, testAuthenticationDetails)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }

//             try {
//                 await cognitoConnectorObj.authenticate(testCognitoUser, null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
//             }
//         })

//         it("Should call cognitoUser.authenticateUser() and pass the correct args", async () => {
//             const getTokensStub = sinon.stub(cognitoConnectorObj, "getTokens").returns()
//             await cognitoConnectorObj.authenticate(testCognitoUser, testAuthenticationDetails)
//             expect(testCognitoUser.authenticateUser.calledOnce).to.be.true
//             getTokensStub.restore()
//         })

//         it("Should call getTokens and pass the correct args", async () => {
//             const expectedResult = "OK"
//             testCognitoUser.authenticateUser = sinon.stub().callsFake((authDetails, callbacks) => callbacks.onSuccess(expectedResult))

//             const getTokensStub = sinon.stub(cognitoConnectorObj, "getTokens").returns()
//             await cognitoConnectorObj.authenticate(testCognitoUser, testAuthenticationDetails)
//             expect(testCognitoUser.authenticateUser.calledOnce).to.be.true
//             expect(getTokensStub.getCall(0).args[0]).to.equal(expectedResult)
//             getTokensStub.restore()
//         })

//         it("Should call throw error when cognitoUser.authenticateUser() fails", async () => {
//             const error = new Error("TEST_ERROR")
//             testCognitoUser.authenticateUser = sinon.stub().callsFake((authDetails, callbacks) => callbacks.onFailure(error))
//             try {

//             }catch(err) {
//                 expect(err.message).to.equal(error.message)
//             }
//         })

//         it("Should call cognitoUser.completeNewPasswordChallenge() and pass the password", async () => {
//             testCognitoUser.authenticateUser = sinon.stub().callsFake((authDetails, callbacks) => 
//                 callbacks.newPasswordRequired({}, {}))

//             await cognitoConnectorObj.authenticate(testCognitoUser, testAuthenticationDetails)

//             expect(testCognitoUser.completeNewPasswordChallenge.calledOnce).to.be.true
//             expect(testCognitoUser.completeNewPasswordChallenge.getCall(0).args[0]).to.equal("TEST_PASSWORD")
//         })
//     })
// })