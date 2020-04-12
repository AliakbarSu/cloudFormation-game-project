const { 
    signatureVerificationFailedError,
    invalidKeyError,
    invalidTokenError,
    verify,
    createVerify,
    procesKey,
    getClaimsSafe
 } = require('../../../../src/opt/nodejs/utils/auth/claims')

const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)




describe("Utils:Auth:claims", function() {
    describe("invalidTokenError", function() {
        it("Should create a new error object", () => {
            expect(invalidTokenError().message).to.equal("INVALID_TOKEN_PROVIDED")
        })
    })

    describe("invalidKeyError", function() {
        it("Should create a new error object", () => {
            expect(invalidKeyError().message).to.equal("INVALID_KEY_PROVIDED")
        })
    })

    describe("signatureVerificationFailedError", function() {
        it("Should create a new error object", () => {
            expect(signatureVerificationFailedError().message).to.equal("SIGNATURE_VERIFICATION_FAILED")
        })
    })

    describe("verify", function() {
        const mockClaims = {key: "value"}
        let verifierStub

        it("Should resolve to verified claims", () => {
            verifierStub = fake.resolves(mockClaims)
            expect(verify(verifierStub, "test_token")).to.become(mockClaims)
            expect(verifierStub.calledOnce).to.be.true
            expect(verifierStub.getCall(0).args[0]).to.equal("test_token")
        })

        it("Should reject when verification fails", () => {
            verifierStub = fake.rejects()
            expect(verify(verifierStub, "test_token")).to.be.rejected
            expect(verifierStub.calledOnce).to.be.true
            expect(verifierStub.getCall(0).args[0]).to.equal("test_token")
        })
    })

    describe("createVerify", function() {
        const mockVerifier = {verify: "value"}
        const mockKey = "test_key"
        let verifyCreatorStub

        it("Should resolve to a verifier", () => {
            verifyCreatorStub = fake.resolves(mockVerifier.verify)
            expect(createVerify(verifyCreatorStub, mockKey)).to.become(mockVerifier.verify)
            expect(verifyCreatorStub.calledOnce).to.be.true
            expect(verifyCreatorStub.getCall(0).args[0]).to.equal(mockKey)
        })

        it("Should reject when creating verifier fails", () => {
            verifyCreatorStub = fake.rejects()
            expect(createVerify(verifyCreatorStub, mockKey)).to.be.rejected
            expect(verifyCreatorStub.calledOnce).to.be.true
            expect(verifyCreatorStub.getCall(0).args[0]).to.equal(mockKey)
        })
    })

    describe("processKey", function() {
        const mockProcessedKey = "test_key"
        const mockKey = "test_key"
        let processorStub

        it("Should resolve to processedKey", () => {
            processorStub = fake.resolves(mockProcessedKey)
            expect(procesKey(processorStub, mockKey)).to.become(mockProcessedKey)
            expect(processorStub.calledOnce).to.be.true
            expect(processorStub.getCall(0).args[0]).to.equal(mockKey)
        })

        it("Should reject when processing key fails", () => {
            processorStub = fake.rejects()
            expect(procesKey(processorStub, mockKey)).to.be.rejected
            expect(processorStub.calledOnce).to.be.true
            expect(processorStub.getCall(0).args[0]).to.equal(mockKey)
        })
    })
})
