let layerPath = "../../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}



const matchPlayers = require("../../../../src/matchPlayers/matchPlayers");
const SqsConnector = require(layerPath + 'sqs.connector')
const PlayersModel = require(layerPath + 'models/players')
const ApigatewayConnector = require(layerPath + 'apigateway.connector')
const RequestModel = require(layerPath + 'models/request.model')
const db = require(layerPath + 'dynamodb.connector')
const CONSTANTS = require(layerPath + 'constants')

const AWS = require('aws-sdk')
const uuid = require('uuid')
var chai = require('chai');
const assert = chai.assert
const sinon = require('sinon')

describe('MatchPlayers', function() {
  let event, context, deps;
  let searchForPlayersStub, markAsPlayingStub, broadCastMessageStub, addRequestRequestModelStub, addRequestSQSStub;
  let foundPlayers;

  this.beforeEach(() => {
    event = {
      detail: {
        fullDocument: {
          _id: "testUser",
          location: {
            type: "Point",
            coordinates: [124, 123]
          },
          category: "testMe",
          language: "english",
          level: 1,
          connectionId: "testMeAsWell"
        }
      }
    }

    context =  {
      callbackWaitsForEmptyEventLoop: true
    }

    deps = {
      PlayersModel: PlayersModel.obj,
      RequestModel,
      ApigatewayConnector,
      SqsConnector,
      db,
      getId: uuid.v4,
      AWS,
      CONSTANTS,
      SearchPlayer: matchPlayers.searchPlayer
    }

    foundPlayers = [
      {...event.detail.fullDocument, _id: "TestUserOne"},
      {...event.detail.fullDocument, _id: "TestUserTwo"}    
    ]

    searchForPlayersStub = sinon.stub(deps.PlayersModel, "searchForPlayers").resolves(foundPlayers)
    markAsPlayingStub = sinon.stub(deps.PlayersModel, "markPlayersAsPlaying").resolves()
    broadCastMessageStub = sinon.stub(deps.ApigatewayConnector.prototype, "broadcastMessage").resolves()
    addRequestRequestModelStub = sinon.stub(deps.RequestModel.prototype, "addRequest").resolves("TEST REQUEST")
    addRequestSQSStub = sinon.stub(deps.SqsConnector.prototype, "addRequest").resolves()
  })

  this.afterEach(() => {
    searchForPlayersStub.restore()
    markAsPlayingStub.restore()
    broadCastMessageStub.restore()
    addRequestRequestModelStub.restore()
    addRequestSQSStub.restore()
  })



  it("Should call searchPlayer with correct args",  async () => {
    const stub = sinon.stub(deps, "SearchPlayer").resolves()
    await matchPlayers.matchPlayers(deps)(event, context)
    assert.equal(stub.calledOnce, true)
    const userData = {
      _id: event.detail.fullDocument._id,
      location: {
        lat: 123,
        long: 124
      },
      category: "testMe",
      level: 1,
      language: "english",
      connectionId: "testMeAsWell"
    }
    assert.deepNestedInclude(stub.getCall(0).args[0], userData)
    assert.deepNestedInclude(stub.getCall(0).args[1], deps)
    stub.restore()
  });

  it("Should call PlayersModel.searchForPlayers with correct args",  async () => {
    searchForPlayersStub.resolves([])
    await matchPlayers.matchPlayers(deps)(event, context)
    assert.equal(searchForPlayersStub.calledOnce, true)
    const userData = {
      _id: event.detail.fullDocument._id,
      location: {
        lat: 123,
        long: 124
      },
      category: "testMe",
      level: 1,
      language: "english",
      connectionId: "testMeAsWell"
    }
    assert.deepNestedInclude(searchForPlayersStub.getCall(0).args[0], userData)
    
    searchForPlayersStub.rejects(new Error("TEST ERROR"))
    try {
      await matchPlayers.matchPlayers(deps)(event, context)
      throw new Error("FALSE PASS")
    }catch(err) {
      assert.equal(err.message, "TEST ERROR")
    }
    
  });

 
  it("Should call braodcastMessage with correct args",  async () => {
    await matchPlayers.matchPlayers(deps)(event, context)

    assert.equal(broadCastMessageStub.calledOnce, true)
    
    const connectionIds = [event.detail.fullDocument.connectionId, ...foundPlayers.map(p => p.connectionId)]
    const request = JSON.stringify({message: "REQUEST", data: "TEST REQUEST" })
    assert.sameMembers(broadCastMessageStub.getCall(0).args[0], connectionIds)
    assert.deepNestedInclude(broadCastMessageStub.getCall(0).args[1], request)

    class TestError extends Error {
      constructor(...params) {
        super(params);
        this.name = "CONNECTING_PLAYER";
      }
    }

    broadCastMessageStub.rejects(new TestError())

    try {
      await matchPlayers.matchPlayers(deps)(event, context)
      throw new Error("FALSE PASS")
    }catch(err) {
      assert.equal(err.name, "CONNECTING_PLAYER")
    }

  })


  it("Should call markPlayersAsPlaying with correct args",  async () => {
    await matchPlayers.matchPlayers(deps)(event, context)

    assert.equal(markAsPlayingStub.calledOnce, true)

    const playerIds = [event.detail.fullDocument._id, ...foundPlayers.map(p => p._id)]
    assert.sameMembers(markAsPlayingStub.getCall(0).args[0], playerIds)
  })


  it("Should call addRequest with correct args",  async () => {
    await matchPlayers.matchPlayers(deps)(event, context)

    assert.equal(addRequestRequestModelStub.calledOnce, true)
    
    const players = [{
      pid: event.detail.fullDocument._id,
      connectionId: event.detail.fullDocument.connectionId
    }, ...foundPlayers.map(p => ({pid: p._id, connectionId: p.connectionId}))]
    assert.sameDeepMembers(addRequestRequestModelStub.getCall(0).args[0], players)

    addRequestRequestModelStub.rejects(new Error("TEST_ERROR_ADD_REQUEST_REQUEST_MODEL"))
    try {
      await matchPlayers.matchPlayers(deps)(event, context)
      throw new Error("FALSE PASS")
    }catch(err) {
      assert.equal(err.message, "TEST_ERROR_ADD_REQUEST_REQUEST_MODEL")
    }
  })

  it("Should call SQS.addRequest with correct args",  async () => {
    await matchPlayers.matchPlayers(deps)(event, context)

    assert.equal(addRequestSQSStub.calledOnce, true)

    const playerIds = [
      event.detail.fullDocument._id,
      ...foundPlayers.map(p => p._id)
    ]
    
    assert.equal(addRequestSQSStub.getCall(0).args[0], "TEST REQUEST")
    assert.sameMembers(addRequestSQSStub.getCall(0).args[1], playerIds)
    assert.equal(addRequestSQSStub.getCall(0).args[2], event.detail.fullDocument.level)
    assert.equal(addRequestSQSStub.getCall(0).args[3], event.detail.fullDocument.category)
    assert.equal(addRequestSQSStub.getCall(0).args[4], event.detail.fullDocument.language)

    addRequestSQSStub.rejects(new Error("TEST_ERROR_ADD_REQUEST_SQS_CONNECTOR"))
    try {
      await matchPlayers.matchPlayers(deps)(event, context)
      throw new Error("FALSE PASS")
    }catch(err) {
      assert.equal(err.message, "TEST_ERROR_ADD_REQUEST_SQS_CONNECTOR")
    }
  })

});