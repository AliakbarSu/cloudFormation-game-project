let layerPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}

const DynamodbConnector = require(layerPath + 'dynamodb.connector')
const CONSTANTS = require(layerPath + 'constants')
const QuestionModel = require(layerPath + 'models/questions.model')
const GameModel = require(layerPath + 'models/game.model')
const sinon = require('sinon')
var chai = require('chai');
const assert = chai.assert
const AWS = require('aws-sdk')


describe("GameModel", function() {

    let deps, generateQuestionStub;
    let uuidV4Fake = sinon.fake.returns("TEST_ID");
    let gameModelObj;
    let dynamodbConnectorStub;
    let mockConnector = {
        put: sinon.fake.returns({promise: sinon.fake.resolves()})
    }
    deps = {
        DynamodbConnector,
        QuestionModel,
        CONSTANTS,
        getId: uuidV4Fake,
        AWS
    }

    this.beforeAll(() => {
        dynamodbConnectorStub = sinon.stub(DynamodbConnector.prototype, "connector").returns(mockConnector)
        generateQuestionStub = sinon.stub(QuestionModel.prototype, "generateQuize")
    })

    this.beforeEach(() => {
        gameModelObj = new GameModel(deps)
        generateQuestionStub.resolves([{_id: "TEST_QUESTION"}])
    })

    this.afterEach(() => {
        generateQuestionStub.resetHistory()
        uuidV4Fake.resetHistory()
        mockConnector.put = sinon.fake.returns({promise: sinon.fake.resolves()})
    })

    this.afterAll(() => {
        dynamodbConnectorStub.restore()
        generateQuestionStub.restore()
    })
 
    describe("Model Initilization", () => {
        it("Should call dynamodbconnector.init", () => {
            assert.equal(dynamodbConnectorStub.calledOnce, true)
        })
        it("Should return dynamod db connector object", () => {
            assert.deepEqual(gameModelObj.connector, mockConnector)
        })
    })

    describe("createGame", () => {
        let gameFilters;
        let requestId;
        let players;

        this.beforeAll(() => {
            gameFilters = {
                level: 1,
                language: "english",
                subject: "general",
                limit: 5
            }
            requestId = "testRequest";
            players = ["TestPlayerOne", "TestPlayerTwo"]
        })

        it("Should call questionsModel.generateQuize and pass correct args", async () => {
            await gameModelObj.createGame(requestId, players, gameFilters)
            assert.deepEqual(generateQuestionStub.getCall(0).args[0], gameFilters)
        })

        it("Should call dynamodbconnector.put and request_id and players", async () => {
            CONSTANTS.DYNAMODB_GAMES_TABLE = "TEST_TABLE"
            const expectedQuestions = [
                {
                    _id: "testQuestion"
                }
            ]
            generateQuestionStub.resolves(expectedQuestions)
            await gameModelObj.createGame(requestId, players, gameFilters)
            assert.equal(mockConnector.put.calledOnce, true)
            assert.deepNestedInclude(mockConnector.put.getCall(0).args[0].Item, {request_id: requestId})
            assert.deepNestedInclude(mockConnector.put.getCall(0).args[0].Item, {players: players})
            assert.deepNestedInclude(mockConnector.put.getCall(0).args[0], {TableName: "TEST_TABLE"})
            const questionId = expectedQuestions[0]._id
            assert.deepNestedInclude(mockConnector.put.getCall(0).args[0].Item, {questions: {[questionId]: expectedQuestions[0]}})
        })

        it("Should call throw error when requestId, gameFilters and players are not provided", async () => {
            try {
                await gameModelObj.createGame(null, players, gameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                assert.equal(err.message, "REQUIRED_DATA_IS_MISSING")
            }

            try {
                await gameModelObj.createGame(requestId, null, gameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                assert.equal(err.message, "REQUIRED_DATA_IS_MISSING")
            }

            try {
                await gameModelObj.createGame(requestId, players, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                assert.equal(err.message, "REQUIRED_DATA_IS_MISSING")
            }
        })

        it("Should throw error and not call dynamodbconnector.put when not question was found", async () => {
            try {
                generateQuestionStub.resolves([])
                await gameModelObj.createGame(requestId, players, gameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                assert.equal(err.message, "NO_QUESTION_FOUND")
                assert.equal(mockConnector.put.notCalled, true)
            }
        })

        it("Should generate random id for the item", async () => {
            const expectedId = "TEST_ID"
            await gameModelObj.createGame(requestId, players, gameFilters)
            assert.equal(uuidV4Fake.calledOnce, true)
            assert.equal(mockConnector.put.getCall(0).args[0].Item._id, expectedId)
        })

        it("Should created_at and updated_at not be null", async () => {
            await gameModelObj.createGame(requestId, players, gameFilters)
            assert.notEqual(mockConnector.put.getCall(0).args[0].Item.created_at, null)
            assert.notEqual(mockConnector.put.getCall(0).args[0].Item.updated_at, null)
        })
    })

    describe("getPendingGame", function() {
        let gameObject = {
            gameId: "TEST_ID",
            players: ["P_ONE", "P_TWO"]
        }

        let returnedGame = {
            Item: [{}],
            Count: 1
        }

        this.beforeAll(() => {
        })

        beforeEach(() => {
            mockConnector.query = sinon.fake.returns({promise: sinon.fake.resolves(returnedGame)})
            gameModelObj = new GameModel(deps)
        })


        it("Should throw error if gameId is not provided or is null", async () => {
            try {
                await gameModelObj.getPendingGame()
                throw new Error("FALSE_PASS")
            }catch(err) {
                assert.equal(err.message, "GAME_ID_IS_INVALID")
            }
        })

        it("Should call dynamodbconnector.query and pass correct args", async () => {
            CONSTANTS.DYNAMODB_GAMES_TABLE = "TEST_TABLE"
            await gameModelObj.getPendingGame(gameObject)
            assert.deepNestedInclude(mockConnector.query.getCall(0).args[0].TableName, "TEST_TABLE")    
        })
    })


    describe("markQuestionAsFetched", function() {
        const expectedId = "TEST_ID"

        let updatedQuestion = {
            Item: [{}],
            Count: 1
        }

        beforeEach(() => {
            mockConnector.update = sinon.fake.returns({promise: sinon.fake.resolves(updatedQuestion)})
            gameModelObj = new GameModel(deps)
        })

        it("Should throw error if questionId is not passed", async () => {
            try {
                await gameModelObj.markQuestionAsFetched(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                assert.equal(err.message, "INVALID_QUESTION_ID")
            }
        })

        it("Should call dynamodbconnector.update and pass correct args", async () => {
            CONSTANTS.DYNAMODB_GAMES_TABLE = "TEST_TABLE"
            await gameModelObj.markQuestionAsFetched(expectedId)
            
            assert.equal(mockConnector.update.calledOnce, true)
            assert.deepNestedInclude(mockConnector.update.getCall(0).args[0].Key, { "_id": expectedId})
            assert.equal(mockConnector.update.getCall(0).args[0].TableName, "TEST_TABLE")

        })
    })




})