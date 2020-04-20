const { generatePolicy }= require('../../../../src/cognitoAuthorizer/generatePolicy')



const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("cognitoAuthorizer::generatePolicy", function() {
    let mockPrincipalId, mockEffect, mockResource, mockUserEmail

    this.beforeEach(() => {
        mockPrincipalId = "test_principal_id"
        mockEffect = "test_effect"
        mockResource = "test_resource"
        mockUserEmail = "test_user_email"
    })

    it("Should return a response object containing the effect and principal id etc", () => {
        const result = generatePolicy(mockPrincipalId, mockEffect, mockResource, mockUserEmail)
        expect(result.principalId).to.equal(mockPrincipalId)
        expect(result.context.userEmail).to.equal(mockUserEmail)
        expect(result.policyDocument.Statement[0].Action).to.equal("execute-api:Invoke")
        expect(result.policyDocument.Statement[0].Effect).to.equal(mockEffect)
        expect(result.policyDocument.Statement[0].Resource).to.equal(mockResource)
        expect(result.policyDocument.Version).to.equal("2012-10-17")
    })
})