const { 
    failedToAuthenticateUserError,
    unAuthorizedError,
    invalidMethodArnError,
    handlerSafe
 } = require('../../../../src/cognitoAuthorizer/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("cognitoAuthorizer", function() {
    let mockToken, mockMethodArn, parseTokenStub,
    mockEvent, mockClaims

    this.beforeEach(() => {
        mockToken = "test_token"
        mockMethodArn = "mock_method_arn"
        mockClaims = {email: "test@email.com"}
        parseTokenStub = fake.resolves(mockClaims)
        mockEvent = {
            queryStringParameters: {
                Authorizer: mockToken
            },
            methodArn: mockMethodArn
        }
    })

    describe("failedToAuthenticateUserError", function() {
        it("Should return an error object", () => {
            expect(failedToAuthenticateUserError().message).to.equal("FAILED_TO_AUTHENTICATE_USER")
        })
    })

    describe("unAuthorizedError", function() {
        it("Should return an error object", () => {
            expect(unAuthorizedError().message).to.equal("UN_AUTHORIZED")
        })
    })

    describe("invalidMethodArnError", function() {
        it("Should return an error object", () => {
            expect(invalidMethodArnError().message).to.equal("INVALID_METHOD_ARN")
        })
    })

    describe("handlerSafe", function() {
        it("Should reject if methodArn is invalid", async () => {
            mockEvent.methodArn = null
            try {
                await handlerSafe(parseTokenStub, mockEvent)
            }catch(err) {
                expect(err.message).to.equal("INVALID_METHOD_ARN")
            }
        })

        it("Should reject if token is invalid", async () => {
            mockEvent.queryStringParameters.Authorizer = null
            try {
                await handlerSafe(parseTokenStub, mockEvent)
            }catch(err) {
                expect(err.message).to.equal("INVALID_TOKEN_PROVIDED")
            }
        })

        it("Should reject if parsing token fails", async () => {
            parseTokenStub = fake.rejects()
            try {
                await handlerSafe(parseTokenStub, mockEvent)
            }catch(err) {
                expect(err.message).to.equal("UN_AUTHORIZED")
            }
        })

        it("Should reject if generating policy fails", async () => {
            parseTokenStub = fake.resolves({email: null})
            try {
                await handlerSafe(parseTokenStub, mockEvent)
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_AUTHENTICATE_USER")
            }
        })

        it("Should resolve to an allow policy if authorization succeed", async () => {
            const policy = await handlerSafe(parseTokenStub, mockEvent)
            expect(policy.policyDocument.Statement[0].Effect).to.equal("Allow")
        })


    })
    
})