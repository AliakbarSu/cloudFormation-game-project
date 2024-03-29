const { 
    invalidUrlError,
    failedToFetchKeysError,
    _fetchKeys,
    fetchKeysSafe
 } = require('../../../../src/opt/nodejs/utils/auth/keys')

const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)



describe("Utils:Auth:keys", function() {
    describe("invalidUrlError", function() {
        it("Should return an error object", () => {
            expect(invalidUrlError().message).to.equal("INVALID_URL_PROVIDED")
        })
    })

    describe("failedToFetchKeysError", function() {
        it("Should return an error object", () => {
            expect(failedToFetchKeysError().message).to.equal("FAILED_TO_FETCH_KEYS")
        })
    })

    describe("fetchKeysSafe", function() {
        it("Should reject if call to api fails", (done) => {
            const apiStub = fake.rejects()
            fetchKeysSafe(apiStub, "test_url").catch(err => {
                expect(apiStub.calledOnce).to.be.true
                expect(apiStub.getCall(0).args[0]).to.equal("test_url")
                done()    
            })
        })

        it("Should resolve to the keys array", (done) => {
            const mockKeys = ["key1", "key2"]
            const apiStub = fake.resolves(mockKeys)
            fetchKeysSafe(apiStub, "test_url").then(data => {
                expect(data).to.deep.equal(mockKeys)
                expect(apiStub.calledOnce).to.be.true
                expect(apiStub.getCall(0).args[0]).to.equal("test_url")
                done()
            })
        })
    })

    describe("_fetchKeys", function() {
        const mockKeys = ["key1", "key2"]
        it("Should resolve to keys array of url is valid", (done) => {
            const apiStub = fake.resolves(mockKeys)
            const urlValidatorStub = fake.returns(true)

            _fetchKeys(urlValidatorStub, apiStub, "test_url").then(data => {
                expect(data).to.deep.equal(mockKeys)
                expect(apiStub.calledOnce).to.be.true
                expect(apiStub.getCall(0).args[0]).to.equal("test_url")
                done()
            })
        })

        it("Should rejects if url is invalid", (done) => {
            const apiStub = fake.resolves(mockKeys)
            const urlValidatorStub = fake.returns(false)

            _fetchKeys(urlValidatorStub, apiStub, "invalid_url").catch(err => {
                expect(apiStub.calledOnce).to.be.false
                done()
            })
        })
    })
})