// const handler = require('../../../../src/cognitoAuthorizer/index').handler

// const chai = require('chai')
// const expect = chai.expect
// const sinon = require('sinon')
// const fake = sinon.fake
// const Bottle = require('bottlejs')



// describe("cognitoAuthorizer", function() {
//     let parseTokenStub, gpAllowStub, gpDenyStub, event, context

//     let token = "xglXdTuw0gTjJWT41CEEg2hNuVAiIEdQkTk.H-839dSn9BRYyxu5UZ7xYA"

//     const mockClaims = {
//         email: "test_email"
//     }

//     const mockAllowPolicy = "mock_policy"
//     const mockDenyPolicy = "mock_policy"

    
//     this.beforeEach(() => {

//         Bottle.clear("click")
//         bottle = Bottle.pop("click")

//         bottle.service('generateAllow', function () {
//             gpAllowStub = sinon.fake.returns(mockAllowPolicy)
//             return gpAllowStub
//         })

//         bottle.service("generateDeny", function () {
//             gpDenyStub = sinon.fake.returns(mockDenyPolicy)
//             return gpDenyStub
//         })

//         bottle.service("utils.parseToken", function () {
//             parseTokenStub = sinon.fake.resolves(mockClaims)
//             return parseTokenStub
//         })


//         event = {
//             queryStringParameters: {
//                 Authorizer: token
//             }
//         }
    
//         context = {
//             fail: fake.returns(null),
//             succeed: fake.returns(null)
//         }
//     })

//     this.afterAll(() => {
//         Bottle.clear("click")
//     })

//     it("Should call context.fail if token is not valid or not provided", async () => {
//         event.queryStringParameters.Authorizer = null
//         await handler(event, context)
//         expect(context.fail.calledOnce).to.be.true
//         expect(context.fail.getCall(0).args[0]).to.equal("Unauthorized")
//     })

//     it("Should invoke ParseToken and pass the token", async () => {
//         await handler(event, context)
//         expect(parseTokenStub.calledOnce).to.be.true
//     })

//     it("Should invoke generateAllow and pass the correct parameters", async () => {
//         await handler(event, context)
//         expect(gpAllowStub.calledOnce).to.be.true
//         expect(gpAllowStub.getCall(0).args[0]).to.equal("me")
//         expect(gpAllowStub.getCall(0).args[1]).to.equal(event.methodArn)
//         expect(gpAllowStub.getCall(0).args[2]).to.equal(mockClaims.email)
//     })

//     it("Should invoke context.succeed and pass allow policy", async () => {
//         await handler(event, context)
//         expect(context.succeed.calledOnce).to.be.true
//         expect(context.succeed.getCall(0).args[0]).to.equal(mockAllowPolicy)
//     })

//     it("Should call context.fail if authentication fails", async () => {
 
//         bottle.service("utils.parseToken", function () {
//             gpDenyStub = sinon.fake.rejects(mockClaims)
//             return gpDenyStub
//         })
//         await handler(event, context)
//         expect(context.fail.calledOnce).to.be.true
//         expect(context.fail.getCall(0).args[0]).to.equal("Unauthorized")
//     })
// })