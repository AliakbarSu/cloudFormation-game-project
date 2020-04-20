// let layerPath = "../../src/opt/nodejs/";
// if(!process.env['DEV']) {
//     layerPath = "/opt/nodejs/"
// }


// const matchPlayers = require('../../src/matchPlayers/matchPlayers')

// var AWS = require('aws-sdk-mock');
// const mongoose = require('mongoose')
// const chai = require('chai')
// const expect = chai.expect
// const sinon = require('sinon')
// const fs = require("fs")
// const path = require("path")
 


// describe("Integration::matchPlayers", function() {
//     let aggregateStub, modelStub, updateManyStub, updateOneStub, mockModel;
//     let dybPutSpy, dybUpdateSpy, postToConnectionSpy, SQSSendMessageSpy

//     const jsonData = fs.readFileSync(path.resolve(path.join(__dirname, './mockFoundUsers.json')), "utf-8")
//     const mockFoundUsers = JSON.parse(jsonData)

//     this.beforeAll(() => {

//         dybPutSpy = sinon.fake.resolves()
//         postToConnectionSpy = sinon.fake.resolves()
//         SQSSendMessageSpy = sinon.fake.yields(null, {MessageId: "TEST_ID"})
//         AWS.mock('DynamoDB.DocumentClient', "put", dybPutSpy);
//         AWS.mock("ApiGatewayManagementApi", "postToConnection", postToConnectionSpy)
//         AWS.mock('SQS', 'sendMessage', SQSSendMessageSpy);

//         aggregateStub = sinon.fake.returns({exec: sinon.fake.yields(null, mockFoundUsers)})
//         updateManyStub = sinon.fake.resolves()
//         updateOneStub = sinon.fake.yields(null, {})

//         mockModel = sinon.fake.resolves({
//             aggregate: aggregateStub,
//             updateMany: updateManyStub,
//             updateOne: updateOneStub
//         })
//         modelStub = sinon.stub(mongoose, "createConnection").returns({
//             model: mockModel
//         })
//     })

//     this.afterAll(() => {
//         AWS.restore("DynamoDB.DocumentClient")
//         AWS.restore("ApiGatewayManagementApi")
//         AWS.restore("SQS")
//     })


//     it("Should search for players that match the conditions", async () => {
//         const jsonData = fs.readFileSync(path.resolve(path.join(__dirname, './updatedDocument.json')), "utf-8")
//         const updatedDocument = JSON.parse(jsonData)
//         const event = {
//             ...updatedDocument
//         }
//         const context = {
//             callbackWaitsForEmptyEventLoop: true
//         }
//         await matchPlayers.handler(event, context).catch(err => {
//             console.log(err)
//         })
//         expect(aggregateStub.calledOnce).to.be.true
//         expect(postToConnectionSpy.callCount).to.be.greaterThan(1)
//         expect(dybPutSpy.calledOnce).to.be.true
//         expect(SQSSendMessageSpy.calledOnce).to.be.true
//         expect(updateManyStub.calledOnce).to.be.true
//     })
// })