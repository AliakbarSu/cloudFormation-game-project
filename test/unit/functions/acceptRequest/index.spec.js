const { acceptRequestHandler } = require('../../../../src/acceptRequest/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("acceptRequest::index", function() {
    let acceptRequestStub, parseTokenStub, convertToUidStub,
    mockEvent, mockContext, mockClaims, mockRequest

    this.beforeEach(() => {
        mockRequest = {state: "created"}
        mockClaims = {sub: "test_sub"}
        acceptRequestStub = fake.resolves(mockRequest)
        parseTokenStub = fake.resolves(mockClaims)
        convertToUidStub = fake.resolves()

        mockEvent = {
            token: "test_token",
            requestId: "test_requestId"
        }

        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
    })

    it("Should reject if invalid token is passed", (done) => {
        mockEvent.token = ""
        expect(acceptRequestHandler(
            acceptRequestStub, 
            parseTokenStub, 
            convertToUidStub, 
            mockEvent, 
            mockContext)).to.be.rejected.notify(done)
    })

    it("Should reject if invalid requestId is passed", (done) => {
        mockEvent.requestId = ""
        expect(acceptRequestHandler(
            acceptRequestStub, 
            parseTokenStub, 
            convertToUidStub, 
            mockEvent, 
            mockContext)).to.be.rejected.notify(done)
    })

    it("Should resolve to the request object", (done) => {
        expect(acceptRequestHandler(
            acceptRequestStub, 
            parseTokenStub, 
            convertToUidStub, 
            mockEvent, 
            mockContext)).to.become(mockRequest).notify(done)
    })

    it("Should reject if parsing token fails", (done) => {
        parseTokenStub = fake.rejects()
        expect(acceptRequestHandler(
            acceptRequestStub, 
            parseTokenStub, 
            convertToUidStub, 
            mockEvent, 
            mockContext)).to.be.rejected.notify(done)
    })

    it("Should reject if convertSubToUid fails", (done) => {
        convertToUidStub = fake.rejects()
        expect(acceptRequestHandler(
            acceptRequestStub, 
            parseTokenStub, 
            convertToUidStub, 
            mockEvent, 
            mockContext)).to.be.rejected.notify(done)
    })

    it("Should reject if acceptRequest fails", (done) => {
        acceptRequestStub = fake.rejects()
        expect(acceptRequestHandler(
            acceptRequestStub, 
            parseTokenStub, 
            convertToUidStub, 
            mockEvent, 
            mockContext)).to.be.rejected.notify(done)
    })

})