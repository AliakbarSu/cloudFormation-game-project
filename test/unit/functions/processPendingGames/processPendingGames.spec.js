let layerPath = "../../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}



const processPendingGames = require("../../../../src/processPendingGames/processPendingGames")
const GameModel = require(layerPath + 'models/game.model')
const PlayersModel = require(layerPath + 'models/players')
const ApiGatewayConnector = require(layerPath + 'apigateway.connector')
const SqsConnector = require(layerPath + 'sqs.connector')
const db = require(layerPath + 'dynamodb.connector')
const CONSTANTS = require(layerPath + 'constants')

const AWS = require('aws-sdk')
const uuid = require('uuid')
var chai = require('chai');
const assert = chai.assert
const sinon = require('sinon')


describe('Process Pending Games', function() {
  let event, context, deps;
  let getPendingGameStub, 
  broadCastMessageStub, 
  getPlayersConIdsStub, 
  markQuestionAsFetchedStub,
  scheduleNextQuestionStub;

  this.beforeEach(() => {
    event = {
        Records: [
            {
                eventID: '1ef1c0d5bf54e02ab9b8cf1469013a5c',
                eventName: 'INSERT',
                dynamodb: {
                    ApproximateCreationDateTime: 1584886254,
                    Keys: { _id: { S: 'fsfasf' } },
                    NewImage: { 
                        players: {
                            M: {
                                playerOne: {M: {}},
                                playerTwo: {M: {}}
                            }
                        },
                        questions: {
                            L: [
                                {
                                    M: {
                                        qid: { S: "Q_ONE"},
                                        text: { S: "first test question"},
                                        answers: {
                                            L: [
                                                {
                                                    M: {
                                                        aid: { S: "A_ONE"},
                                                        text: { S: "first test answer"}
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                    
                                },
                                {
                                    M: {
                                        qid: { S: "Q_ONE"},
                                        text: { S: "first test question"},
                                        answers: {
                                            L: [
                                                {
                                                    M: {
                                                        aid: { S: "A_ONE"},
                                                        text: { S: "first test answer"}
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                    
                                }
                            ]
                        }
                    },
                    SequenceNumber: '38116500000000001441142066'
                },
                eventSourceARN: 'arn:aws:dynamodb:us-east-2:178001805015:table/games/stream/2020-03-17T06:21:52.599'
            }
        ]
          
    }

    context =  {
      callbackWaitsForEmptyEventLoop: true
    }

    deps = {
      GameModel,
      PlayersModel: PlayersModel.obj,
      ApiGatewayConnector: ApiGatewayConnector,
      SqsConnector: SqsConnector,
      getId: uuid.v4,
      DynamodbConnector: db,
      AWS,
      CONSTANTS,
      processGame: processPendingGames.processGame
    }

    getPendingGameStub = sinon.stub(deps.GameModel.prototype, "getPendingGame").resolves({Items: [], Count: 0})
    getPlayersConIdsStub = sinon.stub(deps.PlayersModel, "getPlayersConIds").resolves(["conIdOne", "conIdTwo"])
    scheduleNextQuestionStub = sinon.stub(deps.SqsConnector.prototype, "scheduleNextQuestion").resolves()
    broadCastMessageStub = sinon.stub(ApiGatewayConnector.prototype, "broadcastMessage").resolves()
    markQuestionAsFetchedStub = sinon.stub(deps.GameModel.prototype, "markQuestionAsFetched").resolves()

  })

  this.afterEach(() => {
    getPendingGameStub.restore()
    getPlayersConIdsStub.restore()
    scheduleNextQuestionStub.restore()
    broadCastMessageStub.restore()
    markQuestionAsFetchedStub.restore()
  })


  it("Should only invoke processGame if eventName is 'INSERT'",  async () => {
    const processGameStub = sinon.stub(deps, "processGame").resolves()

    event.Records[0].eventName = "UPDATE"
    await processPendingGames.processPendingGames(deps)(event, context)

    assert.equal(processGameStub.calledOnce, false)
    
    event.Records[0].eventName = "INSERT"
    await processPendingGames.processPendingGames(deps)(event, context)

    assert.equal(processGameStub.calledOnce, true)

    processGameStub.restore()
  });

  it("Should invoke processGame with correct args",  async () => {

    const processGameStub = sinon.stub(deps, "processGame").resolves()
    await processPendingGames.processPendingGames(deps)(event, context)

    const games = event.Records.map(r => ({
        gameId: r.dynamodb.Keys._id.S
    }))

    assert.equal(processGameStub.calledOnce, true)
    assert.deepInclude(processGameStub.getCall(0).args[0], games[0])

    processGameStub.rejects(new Error("PROCESS_GAME_TEST_ERROR"))

    try {
        await processPendingGames.processPendingGames(deps)(event, context)
        throw new Error("FALSE PASS")
    }catch(err) {
        assert.equal(err.message, "PROCESS_GAME_TEST_ERROR")
    }

    processGameStub.restore()
  });

  it("Should call PlayersModel.getPlayersConIds with correct args",  async () => {

    await processPendingGames.processPendingGames(deps)(event, context)

    assert.equal(getPlayersConIdsStub.calledOnce, true)
    assert.sameMembers(getPlayersConIdsStub.getCall(0).args[0], ["playerOne", "playerTwo"])

    class TestError extends Error {
      constructor(...params) {
        super(params);
        this.name = "CONNECTING_PLAYER";
      }
    }

    broadCastMessageStub.rejects(new TestError())

    try {
        await processPendingGames.processPendingGames(deps)(event, context)
        throw new Error("FALSE PASS")
    }catch(err) {
      assert.equal(err.name, "CONNECTING_PLAYER")
    }

  })

  it("Should call braodcastMessage with correct args",  async () => {

    await processPendingGames.processPendingGames(deps)(event, context)

    assert.equal(broadCastMessageStub.calledOnce, true)
    assert.sameMembers(broadCastMessageStub.getCall(0).args[0], ["conIdOne", "conIdTwo"])

    class TestError extends Error {
      constructor(...params) {
        super(params);
        this.name = "CONNECTING_PLAYER";
      }
    }

    broadCastMessageStub.rejects(new TestError())

    try {
        await processPendingGames.processPendingGames(deps)(event, context)
        throw new Error("FALSE PASS")
    }catch(err) {
        console.log(err)
      assert.equal(err.name, "CONNECTING_PLAYER")
    }

  })


});