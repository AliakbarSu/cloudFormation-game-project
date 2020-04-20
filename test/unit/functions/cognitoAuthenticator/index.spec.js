const { handlerSafe } = require('../../../../src/cognitoAuthenticator/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const {
    invalidUsernameError,
    invalidPasswordError
} = require('../../../../src/opt/nodejs/utils/errors/general')



describe("cognitoAuthenticator", function() {
    let authenticateUserStub, mockTokenId, mockRefreshToken,
    mockUsername, mockPassword, mockEvent, mockContext

    this.beforeEach(() => {
        mockUsername = "test_username"
        mockPassword = "test_password"
        mockTokenId = "test_token_id"
        mockRefreshToken = "test_refresh_token"
        mockContext = {
            callbackWaitsForEmptyEventLoop: true,
            awsRequestId: "test_request_id"
        }
        mockEvent = {
            username: mockUsername,
            password: mockPassword
        }
        authenticateUserStub = fake.resolves({
            tokenId: mockTokenId,
            refreshToken: mockRefreshToken
        })
    })


    it("Should reject if username is invalid", async () => {
        mockEvent.username = null
        try {
            await handlerSafe(authenticateUserStub, mockEvent, mockContext)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(err.message).to.equal(invalidUsernameError().message)
        }
    })

    it("Should reject if password is invalid", async () => {
        mockEvent.password = null
        try {
            await handlerSafe(authenticateUserStub, mockEvent, mockContext)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(err.message).to.equal(invalidPasswordError().message)
        }
    })

    it("Should reject to a 500 error type if authenticating user fails", async () => {
        authenticateUserStub = fake.rejects(new Error())
        try {
            await handlerSafe(authenticateUserStub, mockEvent, mockContext)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(err.httpStatus).to.equal(500)
            expect(err.requestId).to.equal(mockContext.awsRequestId)
            expect(err.message).to.equal("An unkown error has occured. Please try again.")
            expect(err.errorType).to.equal("InternalServerError")
        }
    })

    it("Should resolve to an object containing tokenId, refreshToken, and username", async () => {
        const result = await handlerSafe(authenticateUserStub, mockEvent, mockContext)
        expect(result.token).to.equal(mockTokenId)
        expect(result.refresh).to.equal(mockRefreshToken)
        expect(result.username).to.equal(mockUsername)
    })

})