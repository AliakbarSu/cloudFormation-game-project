let layerPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}


const processPendingRequests = require('../../src/processPendingRequests/processPendingRequests')

var AWS = require('aws-sdk-mock');
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const fs = require("fs")
const path = require("path")
 


describe("Integration::processPendingRequests", function() {
    let dybPutSpy, dybQuerySpy, postToConnectionSpy, SQSSendMessageSpy, dybScanSpy

    let jsonData = fs.readFileSync(path.resolve(path.join(__dirname, './pendingRequest.json')), "utf-8")
    const mockPendingRequest = {Items: JSON.parse(jsonData), Count: 1}

    jsonData = fs.readFileSync(path.resolve(path.join(__dirname, './mockQuestions.json')), "utf-8")
    const mockQuestions = {Items: JSON.parse(jsonData), Count: 4}

    this.beforeAll(() => {

        dybPutSpy = sinon.fake.resolves()
        dybQuerySpy = sinon.fake.resolves(mockPendingRequest)
        dybScanSpy = sinon.fake.resolves(mockQuestions)
        postToConnectionSpy = sinon.fake.resolves()
        SQSSendMessageSpy = sinon.fake.yields(null, {MessageId: "TEST_ID"})

        AWS.mock('DynamoDB.DocumentClient', "put", dybPutSpy);
        AWS.mock('DynamoDB.DocumentClient', "query", dybQuerySpy);
        AWS.mock('DynamoDB.DocumentClient', "scan", dybScanSpy);
    })

    this.beforeEach(() => {
        dybPutSpy.resetHistory()
        dybQuerySpy.resetHistory()
        dybScanSpy.resetHistory()
    })

    this.afterAll(() => {
        AWS.restore("DynamoDB.DocumentClient")
    })


    it("Should fetch request from request table", async () => {
        const jsonData = fs.readFileSync(path.resolve(path.join(__dirname, './SQSrequest.json')), "utf-8")
        const sqsRecords = JSON.parse(jsonData)
        const event = {
            Records: sqsRecords
        }
        const context = {
            callbackWaitsForEmptyEventLoop: true
        }
        await processPendingRequests.handler(event, context)
        expect(dybQuerySpy.calledOnce).to.be.true
        expect(dybQuerySpy.getCall(0).args[0].ExpressionAttributeValues[":id"]).to.equal(sqsRecords[0].messageAttributes.requestId.stringValue)
    })

    it("Should fetch questions from question table", async () => {
        const jsonData = fs.readFileSync(path.resolve(path.join(__dirname, './SQSrequest.json')), "utf-8")
        const sqsRecords = JSON.parse(jsonData)
        const event = {
            Records: sqsRecords
        }
        const context = {
            callbackWaitsForEmptyEventLoop: true
        }
        await processPendingRequests.handler(event, context)
        expect(dybScanSpy.calledOnce).to.be.true
        expect(dybScanSpy.getCall(0).args[0].ExpressionAttributeValues[":category"]).to.equal(mockPendingRequest.Items[0].category)
        expect(dybScanSpy.getCall(0).args[0].ExpressionAttributeValues[":level"]).to.equal("Grade " + mockPendingRequest.Items[0].level)
        expect(dybScanSpy.getCall(0).args[0].ExpressionAttributeValues[":language"]).to.equal(mockPendingRequest.Items[0].language)
    })

    it("Should create new game object in games table", async () => {
        const jsonData = fs.readFileSync(path.resolve(path.join(__dirname, './SQSrequest.json')), "utf-8")
        const sqsRecords = JSON.parse(jsonData)
        const event = {
            Records: sqsRecords
        }
        const context = {
            callbackWaitsForEmptyEventLoop: true
        }
        await processPendingRequests.handler(event, context)
        expect(dybPutSpy.calledOnce).to.be.true
        expect(dybPutSpy.getCall(0).args[0].Item.request_id).to.equal(sqsRecords[0].messageAttributes.requestId.stringValue)
        const expectedQuestions = {}
        mockQuestions.Items.forEach(q => {
            expectedQuestions[q._id] = {...q}
        })
        expect(dybPutSpy.getCall(0).args[0].Item.questions).to.deep.equal(expectedQuestions)
        expect(dybPutSpy.getCall(0).args[0].Item.players).to.deep.equal(mockPendingRequest.Items[0].players)
    })
})