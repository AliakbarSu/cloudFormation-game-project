const {
    failedToProcessRequestsError,
    handlerSafe
} = require('../../../../src/processPendingRequests/processPendingRequests')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('Process Pending Requests', function() {
    let processRequestStub, mockEvent, mockContext,
    mockRequestId

    this.beforeEach(() => {
        mockRequestId = "test_request"
        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
        mockEvent = {
            Records: [
                {
                    messageAttributes: {
                        requestId: {
                            stringValue: mockRequestId
                        }
                    }
                },
                {
                    messageAttributes: {
                        requestId: {
                            stringValue: mockRequestId
                        }
                    }
            }]
        }
        processRequestStub = fake.resolves()
    })

    describe("failedToProcessRequestsError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessRequestsError().message).to.equal("FAILED_TO_PROCESS_REQUESTS")
        })
    })

    describe("handlerSafe", function() {
        it("Should set callbackWaitsForEmptyEventLoop to false", async () => {
            await handlerSafe(processRequestStub, mockEvent, mockContext)
            expect(mockContext.callbackWaitsForEmptyEventLoop).to.be.false
        })

        it("Should resolve if there is not record to process", async () => {
            mockEvent.Records = []
            const result = await handlerSafe(processRequestStub, mockEvent, mockContext)
            expect(result).to.equal("NO_REQUEST_TO_PROCESS")
        })

        it("Should reject if no records were processed", async () => {
            processRequestStub = fake.rejects()
            try {
                await handlerSafe(processRequestStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_REQUESTS")
            }
        })

        it("Should resolve to an array containing failed records", async () => {
            const result = await handlerSafe(processRequestStub, mockEvent, mockContext)
            expect(result.length).to.equal(0)
        })
    })

})