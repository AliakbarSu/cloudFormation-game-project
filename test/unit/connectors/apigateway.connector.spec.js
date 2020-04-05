let layerPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}


const apigatewayConnector = require(layerPath + 'apigateway.connector')
const PlayersModel = require(layerPath + 'models/players')
const CONSTANTS = require(layerPath + 'constants')
const AWS = require('aws-sdk')
const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")


describe("Apigateway Connector", function() {
    let deps, apigatewayConnectorObj;
    let apiGatewayManagementApiStub;
    let mockApiGatewayManagementApi = {}
    let deregisterConnectionIdStub;

    deps = {
        CONSTANTS,
        AWS,
        PlayersModel: PlayersModel.obj
    }

    this.beforeAll(() => {
        deregisterConnectionIdStub = sinon.stub(PlayersModel.obj, "deregisterConnectionId").resolves()
        apiGatewayManagementApiStub = sinon.stub(AWS, "ApiGatewayManagementApi").callsFake(() => mockApiGatewayManagementApi)
        apigatewayConnectorObj = new apigatewayConnector(deps)
    })

    this.afterEach(() => {
        apiGatewayManagementApiStub.resetHistory()
        deregisterConnectionIdStub.resetHistory()
    })

    this.afterAll(() => {
        apiGatewayManagementApiStub.restore()
        deregisterConnectionIdStub.restore()
    })

    describe("Module Initialization", function() {
        this.beforeAll(() => {
            apiGatewayManagementApiStub.resetHistory()
        })
        it("Should call aws.Dynamodb.DocumentClient constructor", () => {
            apigatewayConnectorObj = new apigatewayConnector(deps)
            expect(apiGatewayManagementApiStub.calledOnce).to.be.true
        })
        it("Should assing _connector to the DocumentClient value", () => {
            expect(apigatewayConnectorObj._connector).to.deep.equal(mockApiGatewayManagementApi)
        })
    })

    describe("get connector", function() {
        it("Should return _connector property", () => {
            const testConnector = "TEST_CONNECTOR"
            apigatewayConnectorObj._connector = testConnector
            expect(apigatewayConnectorObj.connector).to.equal(testConnector)
        })
    })

    describe("generateSocketMessage", function() {
        
        const connectionId = "TEST_CONNECTION";
        const data = JSON.stringify({message: "TEST_MESSAGE"})

        this.beforeEach(() => {
            mockApiGatewayManagementApi.postToConnection = sinon.fake.returns({promise: sinon.fake.resolves()})
            apigatewayConnectorObj = new apigatewayConnector(deps)
        })

        it("Should throw error if connectionId or data is invalid or missing", async () => {
            try {
                await apigatewayConnectorObj.generateSocketMessage(null, data)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
            }

            try {
                await apigatewayConnectorObj.generateSocketMessage(connectionId, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
            }
        })

        it("Should call postToConnection method and pass the correct args", async () => {
            await apigatewayConnectorObj.generateSocketMessage(connectionId, data)
            expect(mockApiGatewayManagementApi.postToConnection.calledOnce).to.be.true
            expect(mockApiGatewayManagementApi.postToConnection.getCall(0).args[0].ConnectionId).to.equal(connectionId)
            expect(mockApiGatewayManagementApi.postToConnection.getCall(0).args[0].Data).to.equal(data)
        })

        it("Should call deps.deregisterConnectionId when message could not be sent and pass conId", async () => {
            const error = new Error()
            error.statusCode = 410
            mockApiGatewayManagementApi.postToConnection = sinon.fake.returns({promise: sinon.fake.rejects(error)})
            apigatewayConnectorObj = new apigatewayConnector(deps)

            await apigatewayConnectorObj.generateSocketMessage(connectionId, data)
            expect(deregisterConnectionIdStub.calledOnce).to.be.true
            expect(deregisterConnectionIdStub.getCall(0).args[0]).to.equal(connectionId)
        })
    })

    describe("broadcastMessage", function() {
        
        const connectionIds =[ "TEST_CONNECTION_ONE", "TEST_CONNECTION_TWO"];
        const data = JSON.stringify({message: "TEST_MESSAGE"})

        this.beforeEach(() => {
            mockApiGatewayManagementApi.postToConnection = sinon.fake.returns({promise: sinon.fake.resolves()})
            apigatewayConnectorObj = new apigatewayConnector(deps)
        })

        it("Should throw error if connectionIds or data is invalid or missing", async () => {
            try {
                await apigatewayConnectorObj.broadcastMessage(null, data)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
            }

            try {
                await apigatewayConnectorObj.broadcastMessage(connectionIds, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("PROVIDED_ARGUMENTS_ARE_INVALID")
            }
        })

        it("Should call generateSocketMessage for every connection id and pass correct args", async () => {
            const generateSocketMessageSpy = sinon.spy(apigatewayConnectorObj, "generateSocketMessage")
            await apigatewayConnectorObj.broadcastMessage(connectionIds, data)
            expect(apigatewayConnectorObj.generateSocketMessage.callCount).to.equal(connectionIds.length)
            expect(apigatewayConnectorObj.generateSocketMessage.getCall(0).args[0]).to.equal(connectionIds[0])
            expect(generateSocketMessageSpy.getCall(0).args[1]).to.equal(data)
            generateSocketMessageSpy.restore()
        })
    })

})
