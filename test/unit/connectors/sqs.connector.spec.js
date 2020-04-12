// let layerPath = "../../../src/opt/nodejs/";
// if(!process.env['DEV']) {
//     layerPath = "/opt/nodejs/"
// }

// const sqsConnector = require(layerPath + 'sqs.connector')
// const CONSTANTS = require(layerPath + 'constants')
// const AWS = require('aws-sdk')
// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")



// xdescribe("SQS Connector, sqs.connector.js", function() {
//     let deps;
//     let sqsConnectorObj;
//     let sqsStub;
//     let mockSQS = {}
    
//     deps = {
//         CONSTANTS,
//         AWS: AWS
//     }

//     this.beforeAll(() => {
//         sqsConnectorObj = new sqsConnector(deps)
//     })

//     this.afterAll(() => {
//         sqsStub.restore()
//     })

//     describe("Module Initialization", function() {
//         this.beforeAll(() => {
//             sqsStub = sinon.stub(AWS, "SQS").callsFake(() => mockSQS)
//         })
//         it("Should call AWS.SQS.constructor", () => {
//             sqsConnectorObj = new sqsConnector(deps)
//             expect(sqsStub.calledOnce).to.be.true
//         })
//     })

//     describe("addRequest", function() {

//         const requestId = "TEST_REQUEST"
//         const playerIds = ["P_ONE", "P_TWO", "P_THREE"]
//         const createdMessage = {
//             MessageId: "TEST_MESSAGE"
//         }

//         this.beforeEach(() => {
//             mockSQS.sendMessage = sinon.fake.yields(null, createdMessage)
//         })

//         it("Should throw error if requestId or playerIds is not provided or is invalid", async () => {
//             try {
//                 await sqsConnectorObj.addRequest(null, playerIds)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
//             }

//             try {
//                 await sqsConnectorObj.addRequest(requestId, null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
//             }

//             try {
//                 await sqsConnectorObj.addRequest(requestId, [])
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
//             }
//         })

//         it("Should call sqsConnector.sendMessage and pass the correct args", async () => {
//             await sqsConnectorObj.addRequest(requestId, playerIds)

//             expect(mockSQS.sendMessage.calledOnce).to.be.true
//             expect(mockSQS.sendMessage.getCall(0).args[0].MessageAttributes.requestId.StringValue).to.equal(requestId)
//             const expectedData = JSON.stringify({ids: playerIds})
//             expect(mockSQS.sendMessage.getCall(0).args[0].MessageAttributes.playerIds.StringValue).to.equal(expectedData)
//         })

//         it("Should pass the correct sqs que url", async () => {
//             const testUrl = "PENDING_TEST"
//             CONSTANTS.SQS_PENDINGREQUESTS_URL = testUrl
//             sqsConnectorObj = new sqsConnector(deps)
//             await sqsConnectorObj.addRequest(requestId, playerIds)
//             expect(mockSQS.sendMessage.getCall(0).args[0].QueueUrl).to.equal(testUrl)
//         })
//     })

//     describe("scheduleNextQuestion", function() {

//         const gameId = "TEST_GAME"
//         const createdMessage = {
//             MessageId: "TEST_MESSAGE"
//         }

//         this.beforeEach(() => {
//             mockSQS.sendMessage = sinon.fake.yields(null, createdMessage)
//         })

//         it("Should throw error if gameId is not provided or is invalid", async () => {
//             try {
//                 await sqsConnectorObj.scheduleNextQuestion(null)
//                 throw new Error("FALSE_PASS")
//             }catch(err) {
//                 expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
//             }
//         })

//         it("Should call sqsConnector.sendMessage and pass the correct args", async () => {
//             await sqsConnectorObj.scheduleNextQuestion(gameId)

//             expect(mockSQS.sendMessage.calledOnce).to.be.true
//             expect(mockSQS.sendMessage.getCall(0).args[0].MessageAttributes.gameId.StringValue).to.equal(gameId)
//         })

//         it("Should pass the correct sqs que url", async () => {
//             const testUrl = "NEXT_QUESTION"
//             CONSTANTS.SQS_SCHEDULE_NEXT_QUESTION_URL = testUrl
//             sqsConnectorObj = new sqsConnector(deps)
//             await sqsConnectorObj.scheduleNextQuestion(gameId)
//             expect(mockSQS.sendMessage.getCall(0).args[0].QueueUrl, "Should use the next question sqs que url").to.equal(testUrl)
//         })
//     })
// })