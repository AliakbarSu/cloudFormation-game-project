// const generatePolicy = require('../../../../src/cognitoAuthorizer/generatePolicy')




// const chai = require('chai');
// const expect = chai.expect
// const sinon = require('sinon')
// const fake = sinon.fake


// describe("cognitoAuthorizer::generatePolicy", function() {
//     let principalId, effect, resource, userEmail

//     principalId = "test_principal_id"
//     effect = "Allow"
//     resource = "test_resource"
//     userEmail = "test_user"

//     const policy = generatePolicy(principalId, effect, resource, userEmail)

//     it("Should create a policy with correct effect", () => {
//         expect(policy.context.userEmail).to.equal(userEmail)
//         expect(policy.principalId).to.equal(principalId)
//         expect(policy.policyDocument.Statement[0].Effect).to.equal(effect)
//         expect(policy.policyDocument.Statement[0].Resource).to.equal(resource)
//         expect(policy.policyDocument.Statement[0].Action).to.equal("execute-api:Invoke")
//         expect(policy.policyDocument.Version).to.equal("2012-10-17")
//     })
// })