const { 
    postToConnection,
    broadcastMessageSafe,
    broadcastMessagesSafe,
    invalidDataToPostError,
    failedToBroadcastMessageError,
    failedToBroadcastMessagesError,
    failedToGetPostToConnectionMethodError,
    failedToPostToConnectionError,
    constructPostData
 } = require('../../../src/opt/nodejs/connectors/apigateway.connector')

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("Apigateway Connector", function() {
    let mockConnectionId, mockData, postStub, connectorStub

    this.beforeEach(() => {
        mockConnectionId = "test_connectionId"
        mockData = "test_data"
        postStub = fake.returns({promise: fake.resolves()})
        connectorStub = {
            postToConnection: postStub
        }
    })

    describe("invalidDataToPostError", function() {
        it("Should create a new error object", () => {
            expect(invalidDataToPostError().message)
            .to.equal("INVALID_DATA_TO_POST")
        })
    })

    describe("failedToBroadcastMessageError", function() {
        it("Should create a new error object", () => {
            expect(failedToBroadcastMessageError().message)
            .to.equal("FAILED_TO_BROADCAST_MESSAGE")
        })
    })

    describe("failedToBroadcastMessagesError", function() {
        it("Should create a new error object", () => {
            expect(failedToBroadcastMessagesError().message)
            .to.equal("FAILED_TO_BROADCAST_MESSAGES")
        })
    })

    describe("failedToGetPostToConnectionMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetPostToConnectionMethodError().message)
            .to.equal("FAILED_GET_POST_TO_CONNECTION_METHOD")
        })
    })

    describe("failedToPostToConnectionError", function() {
        it("Should create a new error object", () => {
            expect(failedToPostToConnectionError().message)
            .to.equal("FAILED_POST_TO_CONNECTION")
        })
    })

    describe("constructPostData", function() {
        it("Should return an object containing ConnectionId, and Data properties", () => {
            const obj = constructPostData(mockConnectionId, mockData)
            expect(obj.ConnectionId).to.equal(mockConnectionId)
            expect(obj.Data).to.equal(mockData)
        })
    })

    describe("postToConnection", function() {
        it("Should reject if data is invalid", async () => {
            try {
                await postToConnection(postStub, mockConnectionId, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_DATA_TO_POST")
            }
        })
        it("Should reject if connection id is invalid", async () => {
            try {
                await postToConnection(postStub, null, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CONNECTION_ID_PROVIDED")
            }
        })

        it("Should reject if posting to connection fails", async () => {
            const error = new Error("TEST_ERROR")
            postStub = fake.returns({promise: fake.rejects(error)})
            try {
                await postToConnection(postStub, mockConnectionId, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err).to.deep.equal(error)
            }
        })

        it("Should resolve if everything went well", async () => {
            try {
                await postToConnection(postStub, mockConnectionId, mockData)
                expect(postStub.calledOnce).to.be.true
                expect(postStub.getCall(0).args[0].ConnectionId).to.equal(mockConnectionId)
                expect(postStub.getCall(0).args[0].Data).to.equal(mockData)
            }catch(err) {
                expect(err).to.deep.equal("FALSE_PASS")
            }
        })
    })

    describe("broadcastMessageSafe", function() {
        it("Should reject if data is invalid", async () => {
            try {
                await broadcastMessageSafe(connectorStub, mockConnectionId, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_DATA_TO_POST")
            }
        })

        it("Should reject if postToConnection is invalid", async () => {
            connectorStub = {
                postToConnection: null
            }
            try {
                await broadcastMessageSafe(connectorStub, mockConnectionId, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_GET_POST_TO_CONNECTION_METHOD")
            }
        })

        it("Should reject if postToConnection fails", async () => {
            const error = new Error("test_error")
            connectorStub = {
                postToConnection: fake.rejects(error)
            }
            try {
                await broadcastMessageSafe(connectorStub, mockConnectionId, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_BROADCAST_MESSAGE")
            }
        })

        it("Should resolve if everything went well", async () => {
            const testData = "test_data"
            connectorStub = {
                postToConnection: fake.returns({promise: fake.resolves(testData)})
            }
            const result = await broadcastMessageSafe(connectorStub, mockConnectionId, mockData)
            expect(result).to.equal(result)
        })
    })

    describe("broadcastMessagesSafe", function() {
        let mockConnectionIds

        this.beforeEach(() => {
            mockConnectionIds = ["con1", "con2", "con3"]
        })

        it("Should reject if data is invalid", async () => {
            try {
                await broadcastMessagesSafe(connectorStub, mockConnectionIds, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_DATA_TO_POST")
            }
        })

        it("Should reject if connectionids is empty array", async () => {
            mockConnectionIds = []
            try {
                await broadcastMessagesSafe(connectorStub, mockConnectionIds, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CONNECTION_ID_PROVIDED")
            }
        })

        it("Should reject if postToConnection is invalid", async () => {
            connectorStub = {
                postToConnection: null
            }
            try {
                await broadcastMessagesSafe(connectorStub, mockConnectionIds, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_GET_POST_TO_CONNECTION_METHOD")
            }
        })

        it("Should reject if postToConnection fails", async () => {
            const error = new Error("test_error")
            connectorStub = {
                postToConnection: fake.rejects(error)
            }
            try {
                await broadcastMessagesSafe(connectorStub, mockConnectionIds, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_BROADCAST_MESSAGES")
            }
        })

        it("Should resolve if everything went well", async () => {
            const testData = "test_data"
            connectorStub = {
                postToConnection: fake.returns({promise: fake.resolves(testData)})
            }
            const result = await broadcastMessagesSafe(connectorStub, mockConnectionIds, mockData)
            expect(result[0]).to.equal(testData)
        })
    })
})
