// const { _getClaims } = require('../../../../src/opt/nodejs/utils/auth/claims')

// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")
// const jose = require('node-jose')
// const fake = sinon.fake




// describe("Utils:Auth:claims", function() {
//     let mockClaims, verifyStub, 
//     token, key, getClaims, mockJose

//     token = "xglXdTuw0gTjJWT41CEEg2hNuVAiIEdQkTk.H-839dSn9BRYyxu5UZ7xYA"
//     key = "test_key"
//     mockClaims = {
//         aud: "TEST_AUD",
//         exp: 2424535646
//     }


    

//     this.beforeAll(() => {
//     })

//     this.beforeEach(() => {
//         verifyStub = fake.resolves({payload: JSON.stringify(mockClaims)})
//         mockJose = {
//             JWK: {
//                 asKey: fake.resolves()
//             },
//             JWS: {
//                 createVerify: fake.returns({verify: verifyStub})
//             }
//         }
//         getClaims = _getClaims({jose: mockJose})
//     })


//     it("Should throw error if key or token is not provided", async () => {
//         try {
//             await getClaims(null, token)
//         }catch(err) {
//             expect(err.message).to.equal("PUBLIC_KEY_OR_TOKEN_NOT_PROVIDED")
//         }

//         try {
//             await getClaims(key, null)
//         }catch(err) {
//             expect(err.message).to.equal("PUBLIC_KEY_OR_TOKEN_NOT_PROVIDED")
//         }
//     })

//     it("Should invoke asKey and pass the key", async () => {
//         await getClaims(key, token)
//         expect(mockJose.JWK.asKey.calledOnce).to.be.true
//     })

//     it("Should invoke createVerify and pass parsedKey", async () => {
//         const parsedKey = "test_key"
//         mockJose.JWK.asKey = fake.resolves(parsedKey)
//         await getClaims(key, token)
//         expect(mockJose.JWS.createVerify.calledOnce).to.be.true
//         expect(mockJose.JWS.createVerify.getCall(0).args[0]).to.equal(parsedKey)
//     })

//     it("Should invoke verify and pass token", async () => {
//         await getClaims(key, token)
//         expect(verifyStub.calledOnce).to.be.true
//         expect(verifyStub.getCall(0).args[0]).to.equal(token)
//     })

//     it("Should return the claims", async () => {
//         const results = await getClaims(key, token)
//         expect(results).to.deep.equal(mockClaims)
//     })

//     it("Should throw verification error if any of the methods fail", async () => {
//         try {
//             mockJose.JWK.asKey = fake.rejects()
//             await getClaims(key, token)
//         }catch(err) {
//             expect(err.message).to.equal("SIGNATURE_VERIFICATION_FAILED")
//         }

//         try {
//             verifyStub = fake.rejects()
//             await getClaims(key, token)
//         }catch(err) {
//             expect(err.message).to.equal("SIGNATURE_VERIFICATION_FAILED")
//         }
//     })
// })
