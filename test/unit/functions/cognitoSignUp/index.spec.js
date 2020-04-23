const {
    failedToGetSignUpMethodError,
    failedToSignUpUserInputsError,
    failedToSignUpUserInternalError,
    encounteredErrorWhileCallingSignUpMethod,
    handlerSafe,
    constructPoolDataObject,
    constructUserAttributeObject,
    signUpUser,
    successResponseObject
} = require('../../../../src/cognitoSignUp/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("cognitoSignUp", function() {
    let mockContext, mockUsername, mockClientId, mockUserPoolId,
    mockEmail, mockPassword, signUpStub, getCognitoUserPoolStub,
    getCognitoUserAttributesStub, getUsernameStub, mockEvent


    this.beforeEach(() => {
        mockUserPoolId = "test_user_pool_id"
        mockUsername = "test_username"
        mockClientId = "test_client_id"
        mockEmail = "test@test.com"
        mockPassword = "test_password"
        mockEvent = {
            username: mockUsername,
            password: mockPassword,
            email: mockEmail
        }
        getUsernameStub = fake.returns(mockUsername)
        signUpStub = fake.yields(null, {user: getUsernameStub})
        getCognitoUserPoolStub = fake.returns({signUp: signUpStub})
        getCognitoUserAttributesStub = fake(arg => arg)
        mockContext = {
            awsRequestId: "test_id"
        }
    })

    describe("failedToGetSignUpMethodError", () => {
        it("Should return an error object", () => {
            expect(failedToGetSignUpMethodError().message).to.equal("FAILED_TO_GET_SIGN_UP_METHOD")
        })
    })

    describe("encounteredErrorWhileCallingSignUpMethod", () => {
        it("Should return an error object", () => {
            expect(encounteredErrorWhileCallingSignUpMethod().message)
            .to.equal("ENCOUNTERED_ERROR_WHILE_CALLING_SIGNUP")
        })
    })

    describe("failedToSignUpUserInternalError", () => {
        it("Should return the correct response object", () => {
            const response = failedToSignUpUserInternalError(mockContext)
            expect(response.errorType).to.equal("InternalServerError")
            expect(response.httpStatus).to.equal(500)
            expect(response.requestId).to.equal(mockContext.awsRequestId)
            expect(response.message).to.equal("An unknown error has occurred. Please try again.")
        })
    })

    describe("failedToSignUpUserInputsError", () => {
        it("Should return the correct response object", () => {
            const response = failedToSignUpUserInputsError(mockContext, "test_message")
            expect(response.errorType).to.equal("Invalid input data")
            expect(response.httpStatus).to.equal(400)
            expect(response.requestId).to.equal(mockContext.awsRequestId)
            expect(response.message).to.equal("test_message")
        })
    })

    describe("constructPoolDataObject", function() {
        it("Should return an object containing UserPoolId, and ClientId properties", () => {
            const result = constructPoolDataObject(mockUserPoolId, mockClientId)
            expect(result.UserPoolId).to.equal(mockUserPoolId)
            expect(result.ClientId).to.equal(mockClientId)
        })
    })

    describe("successResponseObject", function() {
        it("Should return an object containing statusCode, and body properties", () => {
            const result = successResponseObject(mockUsername)
            expect(result.statusCode).to.equal(200)
            expect(result.body).to.contain(mockUsername)
        })
    })

    describe("constructUserAttributeObject", function() {
        it("Should return an object containing Name, and Value properties", () => {
            const result = constructUserAttributeObject("username", mockUsername)
            expect(result.Name).to.equal("username")
            expect(result.Value).to.equal(mockUsername)
        })
    })

    describe("signUpUser", function() {
        let mockAttributes
        this.beforeEach(() => {
            mockAttributes = ["attributeOne"]
        })
        it("Should reject if signUp method fails", async () => {
            const testError = new Error("test_error")
            signUpStub = fake.yields(testError)
            try {
                await signUpUser(signUpStub, mockEmail, mockPassword, mockAttributes)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("ENCOUNTERED_ERROR_WHILE_CALLING_SIGNUP")
            }
        })

        it("Should resolve to data object if signUp method succeeded", async () => {
            const result = await signUpUser(signUpStub, mockEmail, mockPassword, mockAttributes)
            expect(result.user).to.deep.equal(getUsernameStub)
            expect(signUpStub.calledOnce).to.be.true
            expect(signUpStub.getCall(0).args[0]).to.equal(mockEmail)
            expect(signUpStub.getCall(0).args[1]).to.equal(mockPassword)
            expect(signUpStub.getCall(0).args[2]).to.deep.equal(mockAttributes)    
        })
    })

    describe("handlerSafe", function() {
        it("Should handle invalid UserPoolId", async () => {
            mockUserPoolId = null
            try {
                await handlerSafe(
                    getCognitoUserPoolStub, 
                    getCognitoUserAttributesStub, 
                    mockUserPoolId, 
                    mockClientId, 
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.errorType).to.equal("InternalServerError")
            }
        })

        it("Should handle invalid ClientId", async () => {
            mockClientId = null
            try {
                await handlerSafe(
                    getCognitoUserPoolStub, 
                    getCognitoUserAttributesStub, 
                    mockUserPoolId, 
                    mockClientId, 
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.errorType).to.equal("InternalServerError")
            }
        })

        it("Should handle invalid email", async () => {
            mockEvent.email = null
            try {
                await handlerSafe(
                    getCognitoUserPoolStub, 
                    getCognitoUserAttributesStub, 
                    mockUserPoolId, 
                    mockClientId, 
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_EMAIL_PROVIDED")
            }
        })

        it("Should handle invalid username", async () => {
            mockEvent.username = null
            try {
                await handlerSafe(
                    getCognitoUserPoolStub, 
                    getCognitoUserAttributesStub, 
                    mockUserPoolId, 
                    mockClientId, 
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_USERNAME_PROVIDED")
            }
        })

        it("Should handle invalid password", async () => {
            mockEvent.password = null
            try {
                await handlerSafe(
                    getCognitoUserPoolStub, 
                    getCognitoUserAttributesStub, 
                    mockUserPoolId, 
                    mockClientId, 
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_PASSWORD_PROVIDED")
            }
        })

        it("Should handle error gracefully if getting signUp method fails", async () => {
            getCognitoUserPoolStub = fake.returns({signUp: null})
            try {
                await handlerSafe(
                    getCognitoUserPoolStub, 
                    getCognitoUserAttributesStub, 
                    mockUserPoolId, 
                    mockClientId, 
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.errorType).to.equal("InternalServerError")
            }
        })

        it("Should handle error gracefully if signing up user fails", async () => {
            signUpStub = fake.yields("error")
            getCognitoUserPoolStub = fake.returns({signUp: signUpStub})
            try {
                await handlerSafe(
                    getCognitoUserPoolStub, 
                    getCognitoUserAttributesStub, 
                    mockUserPoolId, 
                    mockClientId, 
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.errorType).to.equal("InternalServerError")
            }
        })

        it("Should return the user", async () => {
            const result = await handlerSafe(
                getCognitoUserPoolStub, 
                getCognitoUserAttributesStub, 
                mockUserPoolId, 
                mockClientId, 
                mockEvent,
                mockContext
            )
            expect(result.body).to.contain(mockUsername)
            expect(result.statusCode).to.equal(200)
        })

        it("Should create the correct user", async () => {
            const result = await handlerSafe(
                getCognitoUserPoolStub, 
                getCognitoUserAttributesStub, 
                mockUserPoolId, 
                mockClientId, 
                mockEvent,
                mockContext
            )
            expect(signUpStub.getCall(0).args[0]).to.equal(mockEmail)
            expect(signUpStub.getCall(0).args[1]).to.equal(mockPassword)
            expect(signUpStub.getCall(0).args[2][0].Name).to.equal("email")
            expect(signUpStub.getCall(0).args[2][1].Name).to.equal("username")
        })

        it("Should create the correct user attributes", async () => {
            const result = await handlerSafe(
                getCognitoUserPoolStub, 
                getCognitoUserAttributesStub, 
                mockUserPoolId, 
                mockClientId, 
                mockEvent,
                mockContext
            )
            expect(getCognitoUserAttributesStub.getCall(0).args[0].Name).to.equal("email")
            expect(getCognitoUserAttributesStub.getCall(0).args[0].Value).to.equal(mockEmail)
            expect(getCognitoUserAttributesStub.getCall(1).args[0].Name).to.equal("username")
            expect(getCognitoUserAttributesStub.getCall(1).args[0].Value).to.equal(mockUsername)
        })
    })
})