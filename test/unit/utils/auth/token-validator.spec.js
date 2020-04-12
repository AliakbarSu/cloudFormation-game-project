// const { validate } = require('../../../../src/opt/nodejs/utils/auth/token-validator')

// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")




// describe("Utils:Auth:token-validator", function() {

//     let tokenExpiration = new Date().getTime() + 500
//     let tokenAud = "test_aud"
//     process.env.COGNITO_USER_POOL_CLIENT = tokenAud


//     it("Should throw error if token exp or token aud is not provided", () => {
//         try {
//             validate(null, tokenAud)
//         }catch(err) {
//             expect(err.message).to.be.equal("INVALID_TOKEN_EXP_OR_AUD")
//         }
//         try {
//             validate(tokenExpiration, null)
//         }catch(err) {
//             expect(err.message).to.be.equal("INVALID_TOKEN_EXP_OR_AUD")
//         }
//     })

//     it("Should throw error if token expiration is in the past", () => {
//         try {
//             tokenExpiration = new Date().getTime() - 1000
//             validate(tokenExpiration, tokenAud)
//         }catch(err) {
//             expect(err.message).to.equal("TOKEN_EXPIRED")
//         }
//     })

//     it("Should throw error if token auds do not match", () => {
//         try {
//             process.env.COGNITO_USER_POOL_CLIENT = "wrong_aud"
//             validate(tokenExpiration, tokenAud)
//         }catch(err) {
//             expect(err.message).to.equal("NOT_ISSUED_FOR_TARGET_AUDIENCE")
//         }
//     })

//     it("Should return true", () => {
//         process.env.COGNITO_USER_POOL_CLIENT = tokenAud
//         const result = validate(tokenExpiration, tokenAud)
//         expect(result).to.be.true
//     })

    

    
// })
