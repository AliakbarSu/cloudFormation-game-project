const {
    failedToCreateGameError,
    failedToGenerateIdError,
    failedToGetCurrentTimeError,
    failedToGetPendingGameError,
    failedToGetPutMethodError,
    failedToGetQueryMethodError,
    failedToGetQuestionsError,
    failedToGetUpdateMethodError,
    failedToMarkQuestionAsFetchedError,
    constructCreateGameObject,
    constructGetPendingGameObject,
    constructMarkQuestionAsFetchedObject,
    convertQuestionsArrayToObjectForm,
    getPendingGameSafe,
    createGameSafe,
    markQuestionAsFetchedSafe,
    validateFilters,
    invalidFiltersDataError
} = require('../../../src/opt/nodejs/models/game.model')

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("GameModel", function() {
    let filters, mockTableName, mockGameId, mockQuestionId,
    mockPlayerIds, mockQuestions, mockCurrentTime,
    getTimeStub, connectorStub, generateQuizeStub, mockId,
    mockRequestId, generateIdStub, mockResponse, mockGameFilters

    this.beforeEach(() => {
        filters = {
            subject: "test_subject",
            language: "test_language",
            level: 2,
            limit: 1
        }
        mockTableName = "test_table"
        mockGameId = "test_game"
        mockQuestionId = "test_question"
        mockRequestId = "test_request"
        mockId = "test_id"
        mockRequestId = "test_response"
        mockPlayerIds = ["id1", "id2"]
        mockQuestions = [{_id: "id1", title: "test1"}, {_id: "id2", title: "test2"}]
        mockCurrentTime = 12344
        getTimeStub = fake.returns(mockCurrentTime)
        generateIdStub = fake.returns(mockId)
        mockGameFilters = {
            subject: "test_subject",
            language: "test_language",
            level: 2,
            limit: 1
        }
        connectorStub = {
            put: fake.returns({promise: fake.resolves(mockResponse)}),
            query: fake.returns({promise: fake.resolves(mockResponse)}),
            update: fake.returns({promise: fake.resolves(mockResponse)})
        }
        generateQuizeStub = fake.resolves(mockQuestions)
    })


    describe("failedToCreateGameError", function() {
        it("Should create a new error object", () => {
            expect(failedToCreateGameError().message).to.equal("FAILED_TO_CREATE_GAME")
        })
    })

    describe("failedToGenerateIdError", function() {
        it("Should create a new error object", () => {
            expect(failedToGenerateIdError().message).to.equal("FAILED_TO_GENERATE_ID")
        })
    })

    describe("failedToGetCurrentTimeError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetCurrentTimeError().message).to.equal("FAILED_TO_GET_CURRENT_TIME")
        })
    })

    describe("failedToGetPendingGameError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetPendingGameError().message).to.equal("FAILED_TO_GET_PENDING_GAME")
        })
    })

    describe("failedToGetPutMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetPutMethodError().message).to.equal("FAILED_TO_GET_PUT_METHOD")
        })
    })

    describe("failedToGetQueryMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetQueryMethodError().message).to.equal("FAILED_TO_GET_QUERY_METHOD")
        })
    })

    describe("failedToGetQuestionsError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetQuestionsError().message).to.equal("FAILED_TO_GET_QUESTIONS")
        })
    })

    describe("failedToGetUpdateMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetUpdateMethodError().message).to.equal("FAILED_TO_GET_UPDATE_METHOD")
        })
    })

    describe("failedToMarkQuestionAsFetchedError", function() {
        it("Should create a new error object", () => {
            expect(failedToMarkQuestionAsFetchedError().message).to.equal("FAILED_TO_MARK_QUESTION_AS_FETCHED")
        })
    })

    describe("invalidFiltersDataError", function() {
        it("Should create a new error object", () => {
            expect(invalidFiltersDataError().message).to.equal("INVALID_FILTERS_PROVIDED")
        })
    })

    describe("validateFilters", function() {
        it("Should return false if filters language property is invalid", () => {
            filters.language = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return false if filters level property is invalid", () => {
            filters.level = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return false if filters subject property is invalid", () => {
            filters.subject = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return false if filters level property is invalid", () => {
            filters.limit = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return true if all players properties are valid", () => {
            expect(validateFilters(filters)).to.be.true
        })
    })

    describe("constructGetPendingGameObject", function() {
        it("Should return an object", () => {
            const obj = constructGetPendingGameObject(mockTableName, mockGameId)
            expect(obj.TableName).to.equal(mockTableName)
            expect(obj.ExpressionAttributeValues[":id"]).to.equal(mockGameId)
            expect(obj.ExpressionAttributeValues[":active"]).to.be.true
        })
    })

    describe("constructMarkQuestionAsFetchedObject", function() {
        it("Should return an object", () => {
            const obj = constructMarkQuestionAsFetchedObject(mockTableName, mockQuestionId)
            expect(obj.TableName).to.equal(mockTableName)
            expect(obj.ExpressionAttributeValues[":acceptedValue"]).to.be.true
            expect(obj.Key["_id"]).to.equal(mockQuestionId)
        })
    })

    describe("constructCreateGameObject", function() {
        it("Should return an object", () => {
            const obj = constructCreateGameObject(
                mockTableName,
                mockId,
                mockRequestId,
                mockPlayerIds,
                mockQuestions,
                mockCurrentTime
            )
            expect(obj.TableName).to.equal(mockTableName)
            expect(obj.Item._id).to.equal(mockId)
            expect(obj.Item.request_id).to.equal(mockRequestId)
            expect(obj.Item.players).to.deep.equal(mockPlayerIds)
            expect(obj.Item.questions).to.deep.equal(mockQuestions)
            expect(obj.Item.updated_at).to.equal(mockCurrentTime)
            expect(obj.Item.created_at).to.equal(mockCurrentTime)
        })
    })

    describe("convertQuestionsArrayToObjectForm", function() {
        it("Should convert an array to object", () => {
            const qid = mockQuestions[0]._id
            expect(convertQuestionsArrayToObjectForm(mockQuestions)[qid]._id)
            .to.equal(mockQuestions[0]._id)
            expect(convertQuestionsArrayToObjectForm(mockQuestions)[qid].title)
            .to.equal(mockQuestions[0].title)
        })
    })

    describe("getPendingGameSafe", function() {
        it("Should reject if table name is invalid", async () => {
            try {
                await getPendingGameSafe(connectorStub, null, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_TABLE_NAME_PROVIDED")
            }
        })

        it("Should reject if game id is invalid", async () => {
            try {
                await getPendingGameSafe(connectorStub, mockTableName, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_GAME_ID_PROVIDED")
            }
        })

        it("Should reject if query is invalid", async () => {
            connectorStub.query = null
            try {
                await getPendingGameSafe(connectorStub, mockTableName, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_QUERY_METHOD")
            }
        })

        it("Should reject if query fails", async () => {
            connectorStub.query = fake.returns({promise: fake.rejects()})
            try {
                await getPendingGameSafe(connectorStub, mockTableName, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_PENDING_GAME")
            }
        })

        it("Should resolve if getting pending game succeed", async () => {
            const result = await getPendingGameSafe(connectorStub, mockTableName, mockGameId)
            expect(result).to.equal(mockResponse)
        })
    })

    describe("markQuestionAsFetchedSafe", function() {
        it("Should reject if table name is invalid", async () => {
            try {
                await markQuestionAsFetchedSafe(connectorStub, null, mockQuestionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_TABLE_NAME_PROVIDED")
            }
        })

        it("Should reject if question id is invalid", async () => {
            try {
                await markQuestionAsFetchedSafe(connectorStub, mockTableName, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_QUESTION_ID_PROVIDED")
            }
        })

        it("Should reject if update is invalid", async () => {
            connectorStub.update = null
            try {
                await markQuestionAsFetchedSafe(connectorStub, mockTableName, mockQuestionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_UPDATE_METHOD")
            }
        })

        it("Should reject if update fails", async () => {
            connectorStub.update = fake.returns({promise: fake.rejects()})
            try {
                await markQuestionAsFetchedSafe(connectorStub, mockTableName, mockQuestionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_MARK_QUESTION_AS_FETCHED")
            }
        })

        it("Should resolve if marking question as fetched succeed", async () => {
            const result = await markQuestionAsFetchedSafe(connectorStub, mockTableName, mockQuestionId)
            expect(result).to.equal(mockResponse)
        })
    })

    describe("createGameSafe", function() {
        it("Should reject if table name is invalid", async () => {
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    null,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_TABLE_NAME_PROVIDED")
            }
        })

        it("Should reject if request Id is invalid", async () => {
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    null,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_REQUEST_ID_PROVIDED")
            }
        })

        it("Should reject if players id is invalid", async () => {
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    null, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("PLAYER_IDS_ARRAY_CONTAINS_INVALID_ID")
            }
        })

        it("Should reject if game filters is invalid", async () => {
            mockGameFilters.level = null
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_FILTERS_PROVIDED")
            }
        })

        it("Should reject if put is invalid", async () => {
            connectorStub.put = null
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_PUT_METHOD")
            }
        })

        it("Should reject if generateQuize fails", async () => {
            generateQuizeStub = fake.rejects()
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CREATE_GAME")
            }
        })

        it("Should reject if generateQuize returns empty list", async () => {
            generateQuizeStub = fake.resolves([])
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_QUESTIONS")
            }
        })

        it("Should reject if geTime returns invalid time", async () => {
            getTimeStub = fake.returns(null)
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_CURRENT_TIME")
            }
        })

        it("Should reject if generateId returns invalid id", async () => {
            generateIdStub = fake.returns()
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GENERATE_ID")
            }
        })

        it("Should reject if creating a new game fails", async () => {
            connectorStub.put = fake.returns({promise: fake.rejects()})
            try {
                await createGameSafe(
                    connectorStub,
                    generateQuizeStub,
                    getTimeStub,
                    generateIdStub,
                    mockTableName,
                    mockRequestId,
                    mockPlayerIds, 
                    mockGameFilters)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CREATE_GAME")
            }
        })

        it("Should resolve if creating game succeed", async () => {
            const result = await createGameSafe(
                            connectorStub,
                            generateQuizeStub,
                            getTimeStub,
                            generateIdStub,
                            mockTableName,
                            mockRequestId,
                            mockPlayerIds, 
                            mockGameFilters)
            expect(result).to.equal(mockResponse)
            
        })



    })


})