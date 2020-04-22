const {
    processQuestionSafe,
    convertQuestionsObjectToArrayForm,
    getUnfetchedQuestions,
    failedToProcessQuestionError,
    failedToConvertQuestionsToArrayFormError,
    failedToGetQuestionsError
} = require('../../../../src/processScheduledQuestions/processQuestion')

const chai = require('chai');
const expect = chai.expect 
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe("processQuestion", function() {
    let mockGameId, getGameStub, scheduleNextQuestionStub,
    scheduleResultStub, mockQuestions, mockGame, converterStub

    this.beforeEach(() => {
        mockGameId = "test_game"
        getGameStub = fake.resolves()
        scheduleNextQuestionStub = fake.resolves()
        scheduleResultStub = fake.resolves()
        mockQuestions = {
            questionOne: {
                fetched: false
            },
            questionTwo: {
                fetched: true
            }
        }
        getGameStub = fake.resolves({Items: [{questions: mockQuestions}]})
        converterStub = fake.returns(["questionOne", "questionTwo"])
    })


    describe("failedToProcessQuestionError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessQuestionError().message).to.equal("FAILED_TO_PROCESS_QUESTION")
        })
    })

    describe("failedToConvertQuestionsToArrayFormError", function() {
        it("Should return an error object", () => {
            expect(failedToConvertQuestionsToArrayFormError().message)
            .to.equal("FAILED_TO_CONVERT_QUESTIONS_TO_ARRAY_FORM")
        })
    })

    describe("failedToGetQuestionsError", function() {
        it("Should return an error object", () => {
            expect(failedToGetQuestionsError().message)
            .to.equal("FAILED_TO_GET_QUESTIONS")
        })
    })

    describe("getUnfetchedQuestions", function() {
        const testQuestions = [{fetched: true}, {fetched: false}]
        it("Should return an array only containing fetched questions", () => {
            const result = getUnfetchedQuestions(testQuestions)
            expect(result.length).to.equal(1)
        })
    })

    describe("convertQuestionsObjectToArrayForm", function() {
        it("Should handle error gracefully if getting object keys fails", async () => {
            converterStub = fake.throws()
            try {
                await convertQuestionsObjectToArrayForm(converterStub, mockQuestions)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CONVERT_QUESTIONS_TO_ARRAY_FORM")
            }
        })

        it("Should return an array of questions", async () => {
            const result = await convertQuestionsObjectToArrayForm(converterStub, mockQuestions)
            expect(result.length).to.equal(2)
        })
    })


    describe("processQuestionSafe", function() {
        it("Should handle invalid game id", async () => {
            mockGameId = null
            try { 
                await processQuestionSafe(
                    getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_GAME_ID_PROVIDED")
            }
        })

        it("Should handle error gracefully if getting game fails", async () => {
            getGameStub = fake.rejects()
            try { 
                await processQuestionSafe(
                    getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_QUESTION")
            }
        })

        it("Should handle error gracefully if scheduling next question fails", async () => {
            scheduleNextQuestionStub = fake.rejects()
            try { 
                await processQuestionSafe(
                    getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_QUESTION")
            }
        })

        it("Should handle error gracefully if scheduling result fails", async () => {
            mockQuestions.questionOne.fetched = true
            getGameStub = fake.resolves({
                Items: [{questions: mockQuestions}]
            })
            scheduleResultStub = fake.rejects()
            try { 
                await processQuestionSafe(
                    getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_QUESTION")
            }
        })

        it("Should handle error gracefully if game had no questions", async () => {
            getGameStub = fake.resolves({questions: null})
            try { 
                await processQuestionSafe(
                    getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_QUESTIONS")
            }
        })

        it("Should schedule the result for the correct game", async () => {
            mockQuestions.questionOne.fetched = true
            getGameStub = fake.resolves({
                Items: [{questions: mockQuestions}]
            })
            await processQuestionSafe(
                getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
            expect(scheduleResultStub.getCall(0).args[0]).to.equal(mockGameId)
        })

        it("Should fetch the correct game", async () => {
            await processQuestionSafe(
                getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
            expect(getGameStub.getCall(0).args[0]).to.equal(mockGameId)
        })

        it("Should resolve if next question was scheduled", async () => {
            const result = await processQuestionSafe(
                getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
            expect(result).to.equal("NEXT_QUESTION_WAS_SCHEDULED_SUCCESSFULLY")
        })

        it("Should resolve if result was scheduled", async () => {
            mockQuestions.questionOne.fetched = true
            getGameStub = fake.resolves({
                Items: [{questions: mockQuestions}]
            })
            const result = await processQuestionSafe(
                getGameStub, scheduleNextQuestionStub, scheduleResultStub, converterStub, mockGameId)
            expect(result).to.equal("RESULT_WAS_SCHEDULED_SUCCESSFULLY")
        })
    })

})
