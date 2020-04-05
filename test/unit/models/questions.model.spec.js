let layerPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}


const DynamodbConnector = require(layerPath + 'dynamodb.connector')
const CONSTANTS = require(layerPath + 'constants')
const QuestionsModel = require(layerPath + 'models/questions.model')
const sinon = require('sinon')
var chai = require('chai');
const assert = chai.assert
const uuid = require('uuid')
const AWS = require('aws-sdk')


describe("QuestionsModel", function() {

    let deps
    let uuidV4Fake = sinon.fake.returns("TEST_ID");
    let questionsModelObj;
    let dynamoDbconnectorStub;
    let mockConnector = {put: "test"}

    deps = {
        DynamodbConnector,
        getId: uuid.v4,
        AWS,
        CONSTANTS,
        getId: uuidV4Fake
    }

    this.beforeAll(() => {
        dynamoDbconnectorStub = sinon.stub(DynamodbConnector.prototype, "connector").returns(mockConnector)
        questionsModelObj = new QuestionsModel(deps)
        
    })

    this.beforeEach(() => {
        mockConnector.put = sinon.fake.returns({promise: sinon.fake.resolves()})
    })

    this.afterEach(() => {
        uuidV4Fake.resetHistory()
    })

    this.afterAll(() => {
        dynamoDbconnectorStub.restore()
    })

    describe("Model Initilization", function() {

        it("Should call dynamoDbconnector", () => {
            dynamoDbconnectorStub.resetHistory()
            new QuestionsModel(deps)
            assert.equal(dynamoDbconnectorStub.calledOnce, true)
        })
        it("Should return dynamod db connector object", () => {
            assert.deepEqual(questionsModelObj.connector, mockConnector)
        })
    })

    describe("generateQuize", function() {
        let returnedResults = {
            Count: 1,
            Items: []
        }
        let questionFilters = {
            level: 1,
            subject: "general",
            language: "english",
            limit: 5
        }

        this.beforeEach(() => {
            mockConnector.scan = sinon.fake.returns({promise: sinon.fake.resolves(returnedResults)})
        })

        it("Should throw error if questionFilters are invalid or null", async () => {
            try {
                await questionsModelObj.generateQuize({})
                throw new Error("FALSE_PASS")
            }catch(err) {
                assert.equal(err.message, "INVALID_QUESTION_FILTERS")
            }
        })

        it("Should call dynamodbconnector.scan and pass correct args", async () => {
            CONSTANTS.DYNAMODB_QUESTIONS_TABLE = "TEST_TABLE"
            await questionsModelObj.generateQuize(questionFilters)
            assert.equal(mockConnector.scan.calledOnce, true)
            assert.equal(mockConnector.scan.getCall(0).args[0].TableName, "TEST_TABLE")
            assert.deepInclude(mockConnector.scan.getCall(0).args[0].ExpressionAttributeValues, {":language": questionFilters.language})
        })

        it("Should return the correct number of items", async () => {
            questionFilters.limit = 2
            returnedResults.Count = 3
            returnedResults.Items = ["itemOne", "itemTwo", "itemThree", "itemFour"]
            mockConnector.scan = sinon.fake.returns({promise: sinon.fake.resolves(returnedResults)})
            const result = await questionsModelObj.generateQuize(questionFilters)
            assert.equal(result.length, 2)

            questionFilters.limit = 4
            returnedResults.Count = 1
            returnedResults.Items = ["itemOne"]
            mockConnector.scan = sinon.fake.returns({promise: sinon.fake.resolves(returnedResults)})
            const resultTwo = await questionsModelObj.generateQuize(questionFilters)
            assert.equal(resultTwo.length, 1)
        })
    })

})