const {
    failedToProcessTransfersError,
    handlerSafe
} = require('../../../../src/processPointsTransfer/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('Process Pending Requests', function() {
    let processTransferStub, mockEvent, mockContext,
    mockPlayerId, mockAmount, mockCode

    this.beforeEach(() => {
        mockPlayerId = "test_playerId"
        mockAmount = 10
        mockCode = "to"
        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
        mockEvent = {
            Records: [
                {
                    messageAttributes: {
                        playerId: {
                            stringValue: mockPlayerId
                        },
                        code: {
                            stringValue: mockCode
                        },
                        amount: {
                            stringValue: mockAmount
                        }
                    }
                },
                {
                    messageAttributes: {
                        playerId: {
                            stringValue: mockPlayerId
                        },
                        code: {
                            stringValue: mockCode
                        },
                        amount: {
                            stringValue: mockAmount
                        }
                    }
            }]
        }
        processTransferStub = fake.resolves()
    })

    describe("failedToProcessTransfersError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessTransfersError().message).to.equal("FAILED_TO_PROCESS_TRANSFERS")
        })
    })

    describe("handlerSafe", function() {
        it("Should set callbackWaitsForEmptyEventLoop to false", async () => {
            await handlerSafe(processTransferStub, mockEvent, mockContext)
            expect(mockContext.callbackWaitsForEmptyEventLoop).to.be.false
        })

        it("Should resolve if there is not record to process", async () => {
            mockEvent.Records = []
            const result = await handlerSafe(processTransferStub, mockEvent, mockContext)
            expect(result).to.equal("NO_TRANSFER_TO_PROCESS")
        })

        it("Should reject if no records were processed", async () => {
            processTransferStub = fake.rejects()
            try {
                await handlerSafe(processTransferStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_TRANSFERS")
            }
        })

        it("Should resolve to an array containing failed records", async () => {
            const result = await handlerSafe(processTransferStub, mockEvent, mockContext)
            expect(result.length).to.equal(0)
        })
    })

})