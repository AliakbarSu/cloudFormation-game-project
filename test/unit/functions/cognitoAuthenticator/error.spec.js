// const { mapError } = require('../../../../src/cognitoAuthenticator/error')

// const chai = require('chai');
// const expect = chai.expect

// describe("cognitoAuthenticator::error", function() {

//     const mockError = {
//         code: ""
//     }

//     let mockContext = {
//         awsRequestId: "test_request_id"
//     }

//     it("Should return error object with httpStatus = 401", () => {
//         mockError.code = "NotAuthorizedException"
//         const result = mapError(mockError, mockContext)
//         expect(result.errorType).to.equal("Authentication Error")
//         expect(result.httpStatus).to.equal(401)
//         expect(result.requestId).to.equal(mockContext.awsRequestId)
//         expect(result.message).to.equal("The provided credentials are incorrect.")
//     })

//     it("Should return error object with httpStatus = 409", () => {
//         mockError.code = "UserNotConfirmedException"
//         const result = mapError(mockError, mockContext)
//         expect(result.errorType).to.equal("Authentication Error")
//         expect(result.httpStatus).to.equal(409)
//         expect(result.requestId).to.equal(mockContext.awsRequestId)
//         expect(result.message).to.equal("The email address is not confirmed yet.")
//     })

//     it("Should return error object with httpStatus = 404", () => {
//         mockError.code = "UserNotFoundException"
//         const result = mapError(mockError, mockContext)
//         expect(result.errorType).to.equal("Authentication Error")
//         expect(result.httpStatus).to.equal(404)
//         expect(result.requestId).to.equal(mockContext.awsRequestId)
//         expect(result.message).to.equal("The provided credentials do not match our records.")
//     })

//     it("Should return error object with httpStatus = 409", () => {
//         mockError.code = "PasswordResetRequiredException"
//         const result = mapError(mockError, mockContext)
//         expect(result.errorType).to.equal("Authentication Error")
//         expect(result.httpStatus).to.equal(409)
//         expect(result.requestId).to.equal(mockContext.awsRequestId)
//         expect(result.message).to.equal("You need to reset the password for this user.")
//     })

//     it("Should return error object with httpStatus = 500", () => {
//         mockError.code = "UnkownErrorCode"
//         const result = mapError(mockError, mockContext)
//         expect(result.errorType).to.equal("InternalServerError")
//         expect(result.httpStatus).to.equal(500)
//         expect(result.requestId).to.equal(mockContext.awsRequestId)
//         expect(result.message).to.equal("An unkown error has occured. Please try again.")
//     })
// })