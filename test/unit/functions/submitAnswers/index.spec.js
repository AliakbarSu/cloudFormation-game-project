const {
    failedToSubmitAnswersError,
    handlerSafe
} = require('../../../../src/submitAnswers/index')


const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe("submitAnswers", function() {
    let mockEvent, mockContext, mockGameId,
    mockQuestionId, mockAnswerIds, mockConnectionId,
    findUserByConIdStub, submitAnswersStub, mockTableName

    this.beforeEach(() => {
        mockGameId = "test_game_id"
        mockQuestionId = "test_question_id"
        mockAnswerIds = ["answer1", "answer2"]
        mockConnectionId = "test_connection_id"
        mockTableName = "test_table"
        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
        mockEvent = {
            connectionId: mockConnectionId,
            gameId: mockGameId,
            questionId: mockQuestionId,
            answerIds: mockAnswerIds
        }
        findUserByConIdStub = fake.resolves()
        submitAnswersStub = fake.resolves()
    })


    describe("failedToSubmitAnswersError", function() {
        it("Should return an error object", () => {
            expect(failedToSubmitAnswersError().message).to.equal("FAILED_TO_SUBMIT_ANSWERS")
        })
    })

    describe("handlerSafe", function() {
        it("Should set callbackWaitsForEmptyEventLoop to false", async () => {
            await handlerSafe(findUserByConIdStub, 
                submitAnswersStub, mockTableName, mockEvent, mockContext)
            expect(mockContext.callbackWaitsForEmptyEventLoop).to.be.false
        })

        it("Should handle invalid connectionId", async () => {
            mockEvent.connectionId = null
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CONNECTION_ID_PROVIDED")
            }
        })

        it("Should handle invalid table name", async () => {
            mockTableName = null
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_TABLE_NAME_PROVIDED")
            }
        })

        it("Should handle invalid gameId", async () => {
            mockEvent.gameId = null
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_GAME_ID_PROVIDED")
            }
        })

        it("Should handle invalid questionId", async () => {
            mockEvent.questionId = null
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_QUESTION_ID_PROVIDED")
            }
        })

        it("Should handle empty answer ids array", async () => {
            mockEvent.answerIds = []
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_ANSWER_IDS_PROVIDED")
            }
        })

        it("Should handle invalid answer id", async () => {
            mockEvent.answerIds = [null, ""]
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("ANSWER_IDS_ARRAY_CONTAINS_INVALID_ID")
            }
        })

        it("Should handle gracefully if finding the correct player fails", async () => {
            findUserByConIdStub = fake.rejects()
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_SUBMIT_ANSWERS")
            }
        })

        it("Should handle gracefully if submitting answers fails", async () => {
            submitAnswersStub = fake.rejects()
            try {
                await handlerSafe(findUserByConIdStub, 
                    submitAnswersStub, mockTableName, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_SUBMIT_ANSWERS")
            }
        })

        it("Should resolve if answers were submitted successfully", async () => {
            const result = await handlerSafe(findUserByConIdStub, 
                submitAnswersStub, mockTableName, mockEvent, mockContext)
            expect(result).to.equal("ANSWERS_SUBMITTED_SUCCESSFULLY")
        })
    })
})