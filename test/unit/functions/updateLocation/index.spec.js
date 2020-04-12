// const handler = require('../../../../src/updateLocation/index').handler

// const chai = require('chai');
// const expect = chai.expect
// const sinon = require('sinon')
// const Bottle = require('bottlejs')



// describe("updateLocation::index", function() {
//     let event, context, updateLocationStub


//     this.beforeEach(() => {

//         Bottle.clear("click")
//         const bottle = Bottle.pop("click")
           
//         bottle.service('model.player', function () {
//             updateLocationStub = sinon.fake.resolves()
//             return {
//                 updatePlayersLocation: updateLocationStub
//             }
//         })

//         event = {
//             connectionId: "test_connection_id",
//             data: {
//                 latitude: 123456,
//                 longitude: 123456
//             }
//         }

//         context = {
//             callbackWaitsForEmptyEventLoop: true
//         }
//     })

//     this.afterAll(() => {
//         Bottle.clear("click")
//     })

//     it("Should throw error if connectionId is missing", async () => {
//         try {
//             event.connectionId = null
//             await handler(event, context)
//             throw new Error("FALSE_PASS")
//         }catch(err) {
//             expect(err.message).to.equal("SOME_REQUIRED_ARGS_ARE_MISSING")
//         }
//     })

//     it("Should throw error if latitude is missing", async () => {
//         try {
//             event.data.latitude = ""
//             await handler(event, context)
//             throw new Error("FALSE_PASS")
//         }catch(err) {
//             expect(err.message).to.equal("SOME_REQUIRED_ARGS_ARE_MISSING")
//         }
//     })

//     it("Should throw error if longitude is missing", async () => {
//         try {
//             event.data.longitude = ""
//             await handler(event, context)
//             throw new Error("FALSE_PASS")
//         }catch(err) {
//             expect(err.message).to.equal("SOME_REQUIRED_ARGS_ARE_MISSING")
//         }
//     })

//     it("Should set context.callbackWaitsForEmptyEventLoop to false", async () => {
//         await handler(event, context)
//         expect(context.callbackWaitsForEmptyEventLoop).to.be.false
//     })

//     it("Should invoke updatePlayersLocation and pass correct params", async () => {
//         await handler(event, context)
//         expect(updateLocationStub.calledOnce).to.be.true
//         expect(updateLocationStub.getCall(0).args[0]).to.equal(event.connectionId)
//         expect(updateLocationStub.getCall(0).args[1]).to.equal(event.data.latitude)
//         expect(updateLocationStub.getCall(0).args[2]).to.equal(event.data.longitude)
//     })

//     it("Should throw error when updatePlayersLocation fails", async () => {
//         const error = new Error("test_error")
//         Bottle.clear("click")
//         const bottle = Bottle.pop("click")
           
//         bottle.service('model.player', function () {
//             updateLocationStub = sinon.fake.rejects(error)
//             return {
//                 updatePlayersLocation: updateLocationStub
//             }
//         })
//         try {
//             await handler(event, context)
//         }catch(err) {
//             expect(err).to.deep.equal(error)
//         }
//     })
// })