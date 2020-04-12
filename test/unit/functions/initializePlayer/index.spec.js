// const handler = require('../../../../src/initializePlayer/index').handler

// const chai = require('chai');
// const expect = chai.expect
// const sinon = require('sinon')
// const Bottle = require('bottlejs')


// describe("initializePlayer::index", function() {
//     let event, context, createPlayerStub

//     this.beforeEach(() => {

//         Bottle.clear("click")
//         bottle = Bottle.pop("click")
           
//         bottle.service('model.player', function () {
//             createPlayerStub = sinon.fake.resolves()
//             return {
//                 createPlayer: createPlayerStub
//             }
//         })


//         event = {
//             request: {
//                 userAttributes: {
//                     email: "test_email",
//                     sub: "test_sub"
//                 }
//             }
//         }

//         context = {
//             callbackWaitsForEmptyEventLoop: true
//         }
//     })

//     this.afterAll(() => {
//         Bottle.clear("click")
//     })

//     it("Should throw error if email is missing", async () => {
//         try {
//             event.request.userAttributes.email = null
//             await handler(event, context)
//             throw new Error("FALSE_PASS")
//         }catch(err) {
//             expect(err.message).to.equal("Missing user attributes. Failed to initalize player")
//         }
//     })

//     it("Should throw error if sub is missing", async () => {
//         try {
//             event.request.userAttributes.sub = null
//             await handler(event, context)
//             throw new Error("FALSE_PASS")
//         }catch(err) {
//             expect(err.message).to.equal("Missing user attributes. Failed to initalize player")
//         }
//     })

//     it("Should set context.callbackWaitsForEmptyEventLoop to false", async () => {
//         await handler(event, context)
//         expect(context.callbackWaitsForEmptyEventLoop).to.be.false
//     })

//     it("Should invoke createPlayer and pass correct params", async () => {
//         const expectedData = {
//             sub: event.request.userAttributes.sub,
//             email: event.request.userAttributes.email
//         }
//         await handler(event, context)
//         expect(createPlayerStub.calledOnce).to.be.true
//         expect(createPlayerStub.getCall(0).args[0]).to.deep.equal(expectedData)
//     })

//     it("Should throw error when createPlayer fails", async () => {
//         const error = new Error("test_error")
//         Bottle.clear("click")
//         bottle = Bottle.pop("click")
           
//         bottle.service('model.player', function () {
//             createPlayerStub = sinon.fake.rejects(error)
//             return {
//                 createPlayer: createPlayerStub
//             }
//         })

//         try {
//             await handler(event, context)
//         }catch(err) {
//             expect(err).to.deep.equal(error)
//         }
//     })
// })