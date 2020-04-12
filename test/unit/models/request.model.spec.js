// let layerPath = "../../../src/opt/nodejs/";
// if(!process.env['DEV']) {
//     layerPath = "/opt/nodejs/"
// }


// const DynamodbConnector = require(layerPath + 'dynamodb.connector')
// const CONSTANTS = require(layerPath + 'constants')
// const RequestModel = require(layerPath + 'models/request.model')
// const sinon = require('sinon')
// var chai = require('chai');
// const assert = chai.assert
// const expect = chai.expect
// const AWS = require('aws-sdk')


// xdescribe("Request Model", function() {

//     let deps
//     let uuidV4Fake = sinon.fake.returns("TEST_ID");
//     let requestModelObj;
//     let dynamoDbconnectorStub;
//     let mockConnector = {}

//     deps = {
//         DynamodbConnector,
//         CONSTANTS,
//         AWS,
//         getId: uuidV4Fake
//     }

//     this.beforeAll(() => {
//         dynamoDbconnectorStub = sinon.stub(DynamodbConnector.prototype, "connector").returns(mockConnector)
//         requestModelObj = new RequestModel(deps)
//     })

//     this.beforeEach(() => {
//     })

//     this.afterAll(() => {
//         dynamoDbconnectorStub.restore()
//     })

//     describe("Model Initilization", function() {
//         it("Should call dynamoDbconnector", () => {
//             dynamoDbconnectorStub.resetHistory()
//             new RequestModel(deps)
//             assert.equal(dynamoDbconnectorStub.calledOnce, true)
//         })
//         it("Should return dynamod db connector object", () => {
//             assert.deepEqual(requestModelObj.connector, mockConnector)
//         })
//     })
//     describe("addRequest", function() {

//         const players = [
//             {
//                 pid: "TEST_PLAYERS",
//                 connectionId: "TEST_CON_ID"
//             }
//         ]

//         this.beforeEach(() => {
//             mockConnector.put = sinon.fake.returns({promise: sinon.fake.resolves()})
//         })

//         it("Should throw error if provided arguments are invalid", async () => {
//             try {
//                 await requestModelObj.addRequest()
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 assert.equal(err.message, "INVALID_PLAYERS_DATA")
//             }
//         })

//         it("Should call dynamodbConnector.put and pass correct args", async () => {
//             await requestModelObj.addRequest(players)
//             assert.equal(mockConnector.put.calledOnce, true)

//             expect(mockConnector.put.getCall(0).args[0].Item.players, 
//             "Should contain the player id as object key").to.have.property(players[0].pid)

//             expect(mockConnector.put.getCall(0).args[0].Item.players[players[0].pid]).to.contain.keys("connectionId")
//         })

//         it("Should write data to the correct database table", async () => {
//             CONSTANTS.DYNAMODB_REQUESTS_TABLE = "TEST_TABLE"
//             await requestModelObj.addRequest(players)
//             expect(mockConnector.put.getCall(0).args[0].TableName,
//                 "Should assign the correct database name from CONSTANTS").to.equal("TEST_TABLE")
//         })

//         it("Should call deps.getId and pass it as _id", async () => {
//             const test_request_id = "TEST_REQUEST_ID"
//             uuidV4Fake = sinon.fake.returns(test_request_id)
//             deps.getId = uuidV4Fake
//             requestModelObj = new RequestModel(deps)
//             await requestModelObj.addRequest(players)
//             expect(uuidV4Fake.calledOnce, "Should call getId").to.be.true
//             expect(mockConnector.put.getCall(0).args[0].Item._id,
//                 "Should generate a random id for _id").to.equal(test_request_id)
//         })
//     })

//     describe("getPendingRequest", function() {

//         const testRequest = {
//             requestId: "TEST_REQUEST"
//         }

//         this.beforeEach(() => {
//             mockConnector.query = sinon.fake.returns({promise: sinon.fake.resolves()})
//         })

//         it("Should throw error if request object is not provided", async () => {
//             try {
//                 await requestModelObj.getPendingRequest()
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message, "Wrong input data validation error").to.equal("INVALID_REQUEST_OBJECT")
//             }
//         })
//         it("Should throw error if request.requestId is invalid or missing", async () => {
//             try {
//                 await requestModelObj.getPendingRequest({})
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message, "Wrong input data validation error").to.equal("INVALID_REQUEST_OBJECT")
//             }
//         })

//         it("Should call dynamodbConnector.query and pass correct args", async () => {
//             await requestModelObj.getPendingRequest(testRequest)
//             assert.equal(mockConnector.query.calledOnce, true)

//             expect(mockConnector.query.getCall(0).args[0].ExpressionAttributeValues, 
//             "Should pass the correct request id").to.include({":id": testRequest.requestId})
//         })

//         it("Should write data to the correct database table", async () => {
//             const tableName = "TEST_TABLE_TWO"
//             CONSTANTS.DYNAMODB_REQUESTS_TABLE = tableName
//             await requestModelObj.getPendingRequest(testRequest)
//             expect(mockConnector.query.getCall(0).args[0].TableName,
//                 "Should assign the correct database name from CONSTANTS").to.equal(tableName)
//         })
//     })

//     describe("acceptRequest", function() {

//         const requestId = "TEST_REQUEST"
//         const playerId = "TEST_PLAYER"

//         this.beforeEach(() => {
//             mockConnector.update = sinon.fake.returns({promise: sinon.fake.resolves()})
//         })

//         it("Should throw error if requestId or playerId is invalid or missing", async () => {
//             try {
//                 await requestModelObj.acceptRequest(null, playerId)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message, "Wrong input data validation error").to.equal("PROVIDED_ARGUMENTS_ARE_INVALID_OR_MISSING")
//             }
//             try {
//                 await requestModelObj.acceptRequest(requestId, null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message, "Wrong input data validation error").to.equal("PROVIDED_ARGUMENTS_ARE_INVALID_OR_MISSING")
//             }
//         })

//         it("Should call dynamodbConnector.update and pass correct args", async () => {
//             await requestModelObj.acceptRequest(requestId, playerId)
//             assert.equal(mockConnector.update.calledOnce, true)

//             expect(mockConnector.update.getCall(0).args[0].Key, 
//             "Should pass the correct request id").to.include({"_id": requestId})
//         })

//         it("Should write data to the correct database table", async () => {
//             const tableName = "TEST_TABLE_THREE"
//             CONSTANTS.DYNAMODB_REQUESTS_TABLE = tableName
//             await requestModelObj.acceptRequest(requestId, playerId)
//             expect(mockConnector.update.getCall(0).args[0].TableName,
//                 "Should assign the correct database name from CONSTANTS").to.equal(tableName)
//         })
//     })

// })