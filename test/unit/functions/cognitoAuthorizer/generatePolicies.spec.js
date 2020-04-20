
const {
    generateAllow,
    generateDeny
} = require('../../../../src/cognitoAuthorizer/generatePolicies')

const {
    invalidPrincipleIdError,
    invalidResourceError,
    invalidEmail
} = require('../../../../src/opt/nodejs/utils/errors/general')



const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("cognitoAuthorizer::generatePolicies", function() {
    let mockPrincipalId, mockResource, mockUserEmail

    this.beforeEach(() => {
        mockPrincipalId = "test_principal_id"
        mockResource = "test_resource"
        mockUserEmail = "test@example.com"
    })

    describe("generateAllow", function() {
        it("Should reject if principal id is invalid", async () => {
            try {
                await generateAllow(null, mockResource, mockUserEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidPrincipleIdError().message)
            }
        })

        it("Should reject if resource is invalid", async () => {
            try {
                await generateAllow(mockPrincipalId, null, mockUserEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidResourceError().message)
            }
        })

        it("Should reject if userEmail is invalid", async () => {
            try {
                await generateAllow(mockPrincipalId, mockResource, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidEmail().message)
            }
        })

        it("Should resolve to an allow policy", async () => {
            const policy = await generateAllow(mockPrincipalId, mockResource, mockUserEmail)
            expect(policy.policyDocument.Statement[0].Effect).to.equal("Allow")
            expect(policy.policyDocument.Statement[0].Resource).to.equal(mockResource)
            expect(policy.principalId).to.equal(mockPrincipalId)
            expect(policy.context.userEmail).to.equal(mockUserEmail)
        })
    })

    describe("generateDeny", function() {
        it("Should reject if principal id is invalid", async () => {
            try {
                await generateDeny(null, mockResource, mockUserEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidPrincipleIdError().message)
            }
        })

        it("Should reject if resource is invalid", async () => {
            try {
                await generateDeny(mockPrincipalId, null, mockUserEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidResourceError().message)
            }
        })

        it("Should reject if userEmail is invalid", async () => {
            try {
                await generateDeny(mockPrincipalId, mockResource, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidEmail().message)
            }
        })

        it("Should resolve to a deny policy", async () => {
            const policy = await generateDeny(mockPrincipalId, mockResource, mockUserEmail)
            expect(policy.policyDocument.Statement[0].Effect).to.equal("Deny")
            expect(policy.policyDocument.Statement[0].Resource).to.equal(mockResource)
            expect(policy.principalId).to.equal(mockPrincipalId)
            expect(policy.context.userEmail).to.equal(mockUserEmail)
        })
    })

})