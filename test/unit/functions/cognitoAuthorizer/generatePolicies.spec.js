// const GP = require('../../../../src/cognitoAuthorizer/generatePolicy')
// const { generateAllow, generateDeny } = require('../../../../src/cognitoAuthorizer/generatePolicies')




// const chai = require('chai');
// const expect = chai.expect
// const sinon = require('sinon')
// const fake = sinon.fake


// describe("cognitoAuthorizer::generatePolicies", function() {
//     let generatePolicyStub

//     let mockPolicy = "test_policy"

//     this.beforeAll(() => {
//         generatePolicyStub = sinon.stub(GP, "generatePolicy").returns(mockPolicy)
//     })

//     this.beforeEach(() => {
//         generatePolicyStub.resetHistory()
//     })

//     this.afterAll(() => {
//         generatePolicyStub.restore()
//     })

//     describe("generateAllow", function() {
//         let principalId, effect, resource, userEmail

//         principalId = "test_principal_id"
//         effect = "Allow"
//         resource = "test_resource"
//         userEmail = "test_user"

//         it("Should invoke generatePolicy and pass the correct args", () => {
//             generateAllow(principalId, resource, userEmail)
//             expect(generatePolicyStub.calledOnce).to.be.true
//             expect(generatePolicyStub.getCall(0).args[0]).to.equal(principalId)
//             expect(generatePolicyStub.getCall(0).args[1]).to.equal(effect)
//             expect(generatePolicyStub.getCall(0).args[2]).to.equal(resource)
//             expect(generatePolicyStub.getCall(0).args[3]).to.equal(userEmail)
//         })

//         it("Should return the allow policy", () => {
//             const policy = generateAllow(principalId, resource, userEmail)
//             expect(policy).to.equal(mockPolicy)
//         })
//     })

//     describe("generateDeny", function() {
//         let principalId, effect, resource, userEmail

//         principalId = "test_principal_id"
//         effect = "Deny"
//         resource = "test_resource"
//         userEmail = "test_user"

//         it("Should invoke generatePolicy and pass the correct args", () => {
//             generateDeny(principalId, resource, userEmail)
//             expect(generatePolicyStub.calledOnce).to.be.true
//             expect(generatePolicyStub.getCall(0).args[0]).to.equal(principalId)
//             expect(generatePolicyStub.getCall(0).args[1]).to.equal(effect)
//             expect(generatePolicyStub.getCall(0).args[2]).to.equal(resource)
//         })

//         it("Should return the deny policy", () => {
//             const policy = generateDeny(principalId, resource, userEmail)
//             expect(policy).to.equal(mockPolicy)
//         })
//     })
// })