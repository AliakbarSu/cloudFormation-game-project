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
    let mockToken = "testoinefsfjsafj"
    let mockKey = {kid: "tes_kid"}
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

    describe("getClaimsSafe", function() {
        const mockClaims = {exp: "test_exp", aud: "test_aud"}
        const mockVerifier = {verify: fake.resolves(mockClaims)}
        const mockKey = "test_key"
        let verifyCreatorStub = fake.resolves(mockVerifier)
        const processStub = fake.resolves(mockKey)

        it("Should reject if key is invalid", (done) => {
            expect(getClaimsSafe(processStub, verifyCreatorStub, null, mockToken))
            .to.be.rejected.notify(done)
        })

        it("Should reject if token is invalid", (done) => {
            expect(getClaimsSafe(processStub, verifyCreatorStub, mockKey, null))
            .to.be.rejected.notify(done)
        })

        it("Should to resolve to correct value if everything went well", (done) => {
            expect(getClaimsSafe(processStub, verifyCreatorStub, mockKey, mockToken))
            .to.become(mockClaims).notify(done)
        })
    })

    describe("verify", function() {
        const mockClaims = {key: "value"}
        let verifierStub

        it("Should resolve to verified claims", (done) => {
            verifierStub = fake.resolves(mockClaims)
            verify(verifierStub, "test_token").then(data => {
                expect(data).to.deep.equal(mockClaims)
                expect(verifierStub.calledOnce).to.be.true
                expect(verifierStub.getCall(0).args[0]).to.equal("test_token")
                done()
            })
            
        })

        it("Should reject when verification fails", (done) => {
            verifierStub = fake.rejects()
            verify(verifierStub, "test_token").catch(err => {
                expect(verifierStub.calledOnce).to.be.true
                expect(verifierStub.getCall(0).args[0]).to.equal("test_token")
                done()
            })
        })
    })

    describe("createVerify", function() {
        const mockVerifier = {verify: "value"}
        const mockKey = "test_key"
        let verifyCreatorStub

        it("Should resolve to a verifier", (done) => {
            verifyCreatorStub = fake.resolves(mockVerifier)
            createVerify(verifyCreatorStub, mockKey).then(data => {
                expect(data).to.equal(mockVerifier.verify)
                expect(verifyCreatorStub.calledOnce).to.be.true
                expect(verifyCreatorStub.getCall(0).args[0]).to.equal(mockKey)
                done()
            })
        })

        it("Should reject when creating verifier fails", (done) => {
            verifyCreatorStub = fake.rejects()
            createVerify(verifyCreatorStub, mockKey).catch(err => {
                expect(verifyCreatorStub.calledOnce).to.be.true
                expect(verifyCreatorStub.getCall(0).args[0]).to.equal(mockKey)
                done()
            })
        })
    })

    describe("processKey", function() {
        const mockProcessedKey = "test_key"
        const mockKey = "test_key"
        let processorStub

        it("Should resolve to processedKey", (done) => {
            processorStub = fake.resolves(mockProcessedKey)
            procesKey(processorStub, mockKey).then(data => {
                expect(data).to.equal(mockProcessedKey)
                expect(processorStub.calledOnce).to.be.true
                expect(processorStub.getCall(0).args[0]).to.equal(mockKey)
                done()
            })
        })

        it("Should reject when processing key fails", (done) => {
            processorStub = fake.rejects()
            procesKey(processorStub, mockKey).catch(err => {
                expect(processorStub.calledOnce).to.be.true
                expect(processorStub.getCall(0).args[0]).to.equal(mockKey)
                done()
            })
        })
    })
})
