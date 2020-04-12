// const handler = require('../../../../src/cognitoAuthenticator/index').handler


// const chai = require('chai');
// const expect = chai.expect
// const sinon = require('sinon')
// const fake = sinon.fake
// const Bottle = require('bottlejs')



// describe("cognitoAuthenticator", function() {
//     let mapErrorStub, authenticateUserStub, event, context, bottle

//     const mockError = new Error("test_error")

//     const mockResult = {
//         tokenId: "test_tokenId",
//         refreshToken: "test_refreshToken"
//     }


//     this.beforeEach(() => {

//         Bottle.clear("click")
//         bottle = Bottle.pop("click")
           
//         bottle.service('connector.cognito', function () {
//             authenticateUserStub = sinon.fake.resolves(mockResult)
//             return {
//                 authenticateUser: authenticateUserStub
//             }
//         })

//         bottle.service("utils.mapError", function () {
//             mapErrorStub = sinon.fake.returns(mockError)
//             return mapErrorStub
//         })

//         event = {
//             username: "test_username",
//             password: "test_password"
//         }

//         context = {}

    
//     })

//     this.afterAll(() => {
//         Bottle.clear("click")
//     })


//     it("Should CC.authenticateUser and pass username and password", async () => {
//         await handler(event, context)
//         expect(authenticateUserStub.calledOnce).to.be.true
//         expect(authenticateUserStub.getCall(0).args[0]).to.equal(event.username)
//         expect(authenticateUserStub.getCall(0).args[1]).to.equal(event.password)
//     })

//     it("Should return a success response", async () => {
//         const expectedBody = JSON.stringify({
//             token: mockResult.tokenId,
//             refresh: mockResult.refreshToken,
//             user: event.username
//         })
//         const expectedHeaders = {
//             'Content-Type': 'text/plain',
//             'Access-Control-Allow-Origin': "*"
//         }
//         const response = await handler(event, context)
//         expect(response.statusCode).to.equal(200)
//         expect(response.body).to.equal(expectedBody)
//         expect(response.headers).to.deep.equal(expectedHeaders)
//     })

//     it("Should invoke mapError and pass error and context objects when authentication fails", async () => {
           
//         bottle.service('connector.cognito', function () {
//             authenticateUserStub = sinon.fake.rejects(mockError, context)
//             return {
//                 authenticateUser: authenticateUserStub
//             }
//         })

//         bottle.service("utils.mapError", function () {
//             console.log("running")
//             mapErrorStub = sinon.fake.returns(mockError)
//             return mapErrorStub
//         })

//         try {
//             await handler(event, context)
//             throw new Error("FALSE_PASS")
//         }catch(err) {
//             expect(mapErrorStub.calledOnce).to.be.true
//             expect(mapErrorStub.getCall(0).args[0]).to.deep.equal(mockError)
//             expect(mapErrorStub.getCall(0).args[1]).to.deep.equal(context)
//         }
//     })

//     it("Should return a failed response", async () => {
        
//         bottle.service('connector.cognito', function () {
//             authenticateUserStub = sinon.fake.rejects(mockError)
//             return {
//                 authenticateUser: authenticateUserStub
//             }
//         })

//         bottle.service("utils.mapError", function () {
//             mapErrorStub = sinon.fake.returns(mockError)
//             return mapErrorStub
//         })
        
//         try {
//             await handler(event, context)
//             throw new Error("FALSE_PASS")
//         }catch(err) {
//             expect(err).to.deep.equal(mockError)
//         }
//     })

// })