// const CLAIMS = require('../../../../src/opt/nodejs/utils/auth/claims')
// const KEYS = require('../../../../src/opt/nodejs/utils/auth/keys')
// const KID = require('../../../../src/opt/nodejs/utils/auth/kid-extractor')
// const VALIDATOR = require('../../../../src/opt/nodejs/utils/auth/token-validator')
// const { ParseToken } = require('../../../../src/opt/nodejs/utils/auth/index')

// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")



// describe("Utils:Auth:index", function() {
//     let claimsStub, keysStub, kidStub, validatorStub;

//     const claims = {
//         aud: "testAuth",
//         exp: "242425424"
//     }
//     let token = "test.Token"
//     const keys = [{kid: "key1"}, {kid: "key2"}]
//     let kid = "key2"

//     this.beforeAll(() => {
//         claimsStub = sinon.stub(CLAIMS, "getClaims").resolves(claims)
//         keysStub = sinon.stub(KEYS, "fetchKeys").resolves(keys)
//         kidStub = sinon.stub(KID, "extractKid").returns(kid)
//         validatorStub = sinon.stub(VALIDATOR, "validate").returns(true)
//     })

//     this.beforeEach(() => {
//         claimsStub.resetHistory()
//         keysStub.resetHistory()
//         kidStub.resetHistory()
//         validatorStub.resetHistory()
//     })

//     this.afterEach(() => {
//         claimsStub.resolves(claims)
//         keysStub.resolves(keys)
//         kidStub.returns(kid)
//         validatorStub.returns(true)
//     })

//     this.afterAll(() => {
//         claimsStub.restore()
//         keysStub.restore()
//         kidStub.restore()
//         validatorStub.restore()
//     })

//     it("Should throw error if the token is not passed or is invalid", async () => {
//         try {
//             await ParseToken(null)
//         }catch(err) {
//             expect(err.message).to.equal("INVALID_TOKEN_PROVIDED")
//         }
//     })

//     it("Should invoke extracKid and pass the token", async () => {
//         await ParseToken(token)
//         expect(kidStub.calledOnce).to.be.true
//         expect(kidStub.getCall(0).args[0]).to.equal(token)
//     })

//     it("Should invoke getKeys and pass the keys url", async () => {
//         process.env.KEYS_URL = "test_url"
//         await ParseToken(token)
//         expect(keysStub.calledOnce).to.be.true
//         expect(keysStub.getCall(0).args[0]).to.equal("test_url")
//     })

//     it("Should throw error when fetching keys fails", async () => {
//         const testError = new Error()
//         try {
//             keysStub.rejects(testError)
//             await ParseToken(token)
//         }catch(err) {
//             expect(err).to.deep.equal(testError)
//         }
//     })

//     it("Should throw error when keys do not match", async () => {
//         try {
//             kidStub.returns("key5")
//             await ParseToken(token)
//         }catch(err) {
//             expect(err.message).to.equal("PUBLIC_KEY_NOT_FOUND")
//         }
//     })

//     it("Should invoke getClaims and pass the key and token", async () => {
//         await ParseToken(token)
//         expect(claimsStub.calledOnce).to.be.true
//         expect(claimsStub.getCall(0).args[0].kid).to.equal(kid)
//     })

//     it("Should invoke validate and pass the token expiration and aud", async () => {
//         await ParseToken(token)
//         expect(validatorStub.calledOnce).to.be.true
//         expect(validatorStub.getCall(0).args[0]).to.equal(claims.exp)
//         expect(validatorStub.getCall(0).args[1]).to.equal(claims.aud)
//     })

//     it("Should throw error when token validation fails", async () => {
//         try {
//             validatorStub.returns(false)
//             await ParseToken(token)
//         }catch(err) {
//             expect(err.message).to.equal("TOKEN_IS_NOT_VALID")
//         }
//     })

//     it("Should throw error if claims are invalid", async () => {
//         try {
//             claimsStub.resolves(null)
//             await ParseToken(token)
//         }catch(err) {
//             expect(err.message).to.equal("FAILED_TO_FETCH_CLAIMS")
//         }
//     })

//     it("Should returns claims", async () => {
//         const result = await ParseToken(token)
//         expect(result).to.deep.equal(claims)
//     })
// })