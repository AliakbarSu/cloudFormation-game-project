const {
    failedToProcessQuestionError,
    handlerSafe
} = require('../../../../src/processScheduledQuestions/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('Process Scheduled Questions', function() {
    let processQuestionStub, mockEvent, mockContext,
    mockGameId

    this.beforeEach(() => {
        mockGameId = "test_game"
        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
        mockEvent = {
            Records: [
                {
                    messageAttributes: {
                        gameId: {
                            stringValue: mockGameId
                        }
                    }
                },
                {
                    messageAttributes: {
                        gameId: {
                            stringValue: mockGameId
                        }
                    }
            }]
        }
        processQuestionStub = fake.resolves()
    })

    describe("failedToProcessQuestionError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessQuestionError().message).to.equal("FAILED_TO_PROCESS_QUESTION")
        })
    })

    describe("handlerSafe", function() {
        it("Should set callbackWaitsForEmptyEventLoop to false", async () => {
            await handlerSafe(processQuestionStub, mockEvent, mockContext)
            expect(mockContext.callbackWaitsForEmptyEventLoop).to.be.false
        })

        it("Should resolve if there is not record to process", async () => {
            mockEvent.Records = []
            const result = await handlerSafe(processQuestionStub, mockEvent, mockContext)
            expect(result).to.equal("NO_QUESTION_TO_PROCESS")
        })

        it("Should reject if no records were processed", async () => {
            processQuestionStub = fake.rejects()
            try {
                await handlerSafe(processQuestionStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_QUESTION")
            }
        })

        it("Should resolve to an array containing failed records", async () => {
            const result = await handlerSafe(processQuestionStub, mockEvent, mockContext)
            expect(result.length).to.equal(0)
        })
    })

})