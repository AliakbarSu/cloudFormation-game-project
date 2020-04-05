let layerPath = "../../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}



const processPendingRequests = require("../../../../src/processPendingRequests/processPendingRequests");
const GameModel = require(layerPath + 'models/game.model')
const RequestModel = require(layerPath + 'models/request.model')
const db = require(layerPath + 'dynamodb.connector')
const CONSTANTS = require(layerPath + 'constants')

const AWS = require('aws-sdk')
const uuid = require('uuid')
var chai = require('chai');
const assert = chai.assert
const sinon = require('sinon')

describe('Process Pending Requests', function() {
  let event, context, deps;
  let getPendingRequestStub, createGameStub;

  this.beforeEach(() => {
    event = {
        Records: [
            {
                "messageAttributes": {
                    "requestId": {
                        "stringValue": "7763cbd2-3bb5-47f5-a7ec-90c73b5722Test1"
                    }
                }
            },
            {
                "messageAttributes": {
                    "requestId": {
                        "stringValue": "7763cbd2-3bb5-47f5-a7ec-90c73b5722Test2"
                    }
                }
            }
        ]
    }

    context =  {
      callbackWaitsForEmptyEventLoop: true
    }

    deps = {
      RequestModel: RequestModel,
      GameModel,
      AWS,
      CONSTANTS,
      DynamodbConnector: db,
      getId: uuid.v4,
      processRequest: processPendingRequests.processRequest
    }

    getPendingRequestStub = sinon.stub(deps.RequestModel.prototype, "getPendingRequest").resolves("TEST REQUEST")
    createGameStub = sinon.stub(deps.GameModel.prototype, "createGame").resolves()
  })

  this.afterEach(() => {
    getPendingRequestStub.restore()
    createGameStub.restore()
  })



  it("Should call processRequest with correct args",  async () => {
    const processRequestStub = sinon.stub(deps, "processRequest").resolves()
    await processPendingRequests.processPendingRequests(deps)(event, context)

    const requestIds = event.Records.map(r => ({
        requestId: r.messageAttributes.requestId.stringValue
    }))

    assert.equal(processRequestStub.called, true)
    assert.deepInclude(processRequestStub.getCall(0).args[0], requestIds[0])
    assert.deepInclude(processRequestStub.getCall(1).args[0], requestIds[1])

    processRequestStub.rejects(new Error("PROCESS_REQUEST_TEST_ERROR"))

    try {
        await processPendingRequests.processPendingRequests(deps)(event, context)
        throw new Error("FALSE PASS")
    }catch(err) {
        assert.equal(err.message, "PROCESS_REQUEST_TEST_ERROR")
    }

    processRequestStub.restore()
  });

  it("Should call RequestModel.getPendingRequest with correct args",  async () => {
    const requestIds = event.Records.map(r => ({
        requestId: r.messageAttributes.requestId.stringValue
    }))

    getPendingRequestStub.resolves({Items: [], Count: 0})
    await processPendingRequests.processRequest(requestIds[0], deps)

    assert.equal(getPendingRequestStub.calledOnce, true)
    assert.deepInclude(getPendingRequestStub.getCall(0).args[0], requestIds[0])

    const NoRequestError = new Error("NO_REQUEST_FOUND_TEST")
    getPendingRequestStub.rejects(NoRequestError)

    try {
        await processPendingRequests.processRequest(requestIds[0], deps)
        throw new Error("FALSE PASS")
    }catch(err) {
        assert.equal(err.message, NoRequestError.message)
    }
  });

  it("Should call GameModel.createGame with correct args",  async () => {
    const requestIds = event.Records.map(r => ({
        requestId: r.messageAttributes.requestId.stringValue
    }))

    const requestDoc = {
        Items: [
            {
                players: {
                    PlayerOne: {
                        accepted: true
                    },
                    PlayerTwo: {
                        accepted: true
                    }
                },
                category: "TEST_CATEGORY",
                language: "English",
                level: 1
            }
        ],
        Count: 2
    }
    getPendingRequestStub.resolves(requestDoc)
    await processPendingRequests.processRequest(requestIds[0], deps)

    assert.equal(createGameStub.calledOnce, true)
    assert.equal(createGameStub.getCall(0).args[0], requestIds[0].requestId)
    assert.deepInclude(createGameStub.getCall(0).args[1], requestDoc.Items[0].players)
    assert.deepInclude(createGameStub.getCall(0).args[2], {
        subject: requestDoc.Items[0].category,
        language: requestDoc.Items[0].language,
        level: requestDoc.Items[0].level
    })
    assert.property(createGameStub.getCall(0).args[2], "limit")

    const NoRequestError = new Error("NO_REQUEST_FOUND_TEST")
    getPendingRequestStub.rejects(NoRequestError)

    try {
        await processPendingRequests.processRequest(requestIds[0], deps)
        throw new Error("FALSE PASS")
    }catch(err) {
        assert.equal(err.message, NoRequestError.message)
    }
  });
});