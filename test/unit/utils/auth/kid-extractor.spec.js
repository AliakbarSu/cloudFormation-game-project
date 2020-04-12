// const { _extractKid } = require('../../../../src/opt/nodejs/utils/auth/kid-extractor')

// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")
// const jose = require('node-jose')
// const fake = sinon.fake




// describe("Utils:Auth:kid-extractor", function() {
//     let token, extractKid, mockJose

//     token = "xglXdTuw0gTjJWT41CEEg2hNuVAiIEdQkTk.H-839dSn9BRYyxu5UZ7xYA"
//     kid = "key1"


//     this.beforeAll(() => {
//     })

//     this.beforeEach(() => {
//         mockJose = {
//             util: {
//                 base64url: {
//                     decode: fake.returns(JSON.stringify({kid: kid}))
//                 }
//             }
//         }
//         extractKid = _extractKid({jose: mockJose})
//     })

//     it("Should throw error if token is not provided", () => {
//         try {
//             extractKid(null)
//         }catch(err) {
//             expect(err.message).to.equal("TOKEN_NOT_PROVIDED")
//         }
//     })

//     it("Should invoke jose.utils.base64url.decode and pass first half of the token", () => {
//         extractKid(token)
//         expect(mockJose.util.base64url.decode.calledOnce).to.be.true
//         expect(mockJose.util.base64url.decode.getCall(0).args[0]).to.equal(token.split(".")[0])
//     })

//     it("Should return kid", () => {
//         const result = extractKid(token)
//         expect(result).to.equal(kid)
//     })

    
// })
