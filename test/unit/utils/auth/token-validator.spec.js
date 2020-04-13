const { 
    isTokenExpired,
    tokenExpiredError,
    notIssuedForTargetAudienceError,
    getTimeInMills,
    validate
 } = require('../../../../src/opt/nodejs/utils/auth/token-validator')

const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)




describe("Utils:Auth:token-validator", function() {

    describe('tokenExpiredError', function() {
        it("Should return an error object", () => {
            expect(tokenExpiredError().message).to.equal("TOKEN_EXPIRED")
        })
    })

    describe('notIssuedForTargetAudienceError', function() {
        it("Should return an error object", () => {
            expect(notIssuedForTargetAudienceError().message).to.equal("NOT_ISSUED_FOR_TARGET_AUDIENCE")
        })
    })

    describe("getTimeInMills", function() {
        it("Should return time in milliseconds", () => {
            const timeMock = 10000
            const floorStub = (arg) => arg
            expect(getTimeInMills(floorStub, timeMock)).to.equal(10)
        })
    })

    describe("validate", function() {
        let currentTime = 10
        let expiryTime
        let mockClient = "test_cient"
        let mockAud

        it("Should reject if currentTime is greater than expiry time", (done) => {
            expiryTime = 9
            mockAud = mockClient
            expect(validate(currentTime, mockClient, expiryTime, mockAud)).to.be.rejected.notify(done)
        })

        it("Should resolve to true", (done) => {
            expiryTime = 11
            mockAud = mockClient
            expect(validate(currentTime, mockClient, expiryTime, mockAud)).to.become(true).notify(done)
        })

        it("Should reject if aud does not match client", (done) => {
            expiryTime = 11
            mockAud = "test_aud"
            expect(validate(currentTime, mockClient, expiryTime, mockAud)).to.be.rejected.notify(done)
        })
    })

    describe("isTokenExpired", function() {
        const timeMock = 1000
        const floorStub = (arg) => arg
        let expiryTime = 10000000
        let mockClient = "test_cient"
        let mockAud = mockClient

        it("Should resolve to true if token is not expired and issued for the client", (done) => {
            const tokenValidatorStub = fake.returns(true)
            const audValidatorStub = fake.returns(true)
            expect(isTokenExpired(
                tokenValidatorStub, 
                audValidatorStub, 
                floorStub, 
                timeMock, 
                mockClient, 
                expiryTime, 
                mockAud)).to.become(true).notify(done)
        })

        it("Should reject if token expiry is invalid", (done) => {
            const tokenValidatorStub = fake.returns(false)
            const audValidatorStub = fake.returns(true)
            expect(isTokenExpired(
                tokenValidatorStub, 
                audValidatorStub, 
                floorStub, 
                timeMock, 
                mockClient, 
                expiryTime, 
                mockAud)).to.be.rejected.notify(done)
        })

        it("Should reject if aud is invalid", (done) => {
            const tokenValidatorStub = fake.returns(true)
            const audValidatorStub = fake.returns(false)
            expect(isTokenExpired(
                tokenValidatorStub, 
                audValidatorStub, 
                floorStub, 
                timeMock, 
                mockClient, 
                expiryTime, 
                mockAud)).to.be.rejected.notify(done)
        })

    })
})
