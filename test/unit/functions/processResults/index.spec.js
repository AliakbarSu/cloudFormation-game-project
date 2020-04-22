const {
    handlerSafe,
    failedToProcessResultsError
} = require('../../../../src/processResults/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe("processResults::index", function() {
    let mockEvent, mockContext, mockGameId, processResultStub

    this.beforeEach(() => {
        mockGameId = "test_game_id"
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
        processResultStub = fake.resolves()
    })

    describe("failedToProcessResultsError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessResultsError().message).to.equal("FAILED_TO_PROCESS_RESULTS")
        })
    })

    describe("handlerSafe", function() {

        it("Should set callbackWaitsForEmptyEventLoop to false", async () => {
            await handlerSafe(processResultStub, mockEvent, mockContext)
            expect(mockContext.callbackWaitsForEmptyEventLoop).to.be.false
        })

        it("Should do nothing if there is no record to be processed", async () => {
            mockEvent.Records = []
            const result = await handlerSafe(processResultStub, mockEvent, mockContext)
            expect(result).to.equal("NO_RESULTS_TO_CALCULATE")
        })

        it("Should handle error gracefully if processing result fails", async () => {
            processResultStub = fake.rejects()
            try {
                await handlerSafe(processResultStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_RESULTS")
            }
        })

        it("Should resolve to an array containing failed records", async () => {
            const result = await handlerSafe(processResultStub, mockEvent, mockContext)
            expect(result.length).to.equal(0)
        })
    })
})