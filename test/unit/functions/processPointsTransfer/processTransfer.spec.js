const {
    failedToProcessTransferError,
    processTransferSafe
} = require('../../../../src/processPointsTransfer/processTransfer')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("Process Request", function() {
    let mockSubject, transferPointsStub, mockCode,
    mockAmount, mockPlayerId, mockData

    this.beforeEach(() => {
        mockAmount = 10
        mockCode = "to"
        mockPlayerId = "test_player_id"
        mockData = {
            code: mockCode,
            amount: mockAmount,
            playerId: mockPlayerId
        }
        transferPointsStub = fake.resolves()
    })

    describe("failedToProcessTransferError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessTransferError().message).to.equal("FAILED_TO_PROCESS_TRANSFER")
        })
    })



    describe("processTransfer", function() {

        it("Should reject if playerId is invalid", async () => {
            mockData.playerId = null
            try {
                await processTransferSafe(transferPointsStub, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_PID_PROVIDED")
            }
        })

        it("Should reject if amount is invalid", async () => {
            mockData.amount = null
            try {
                await processTransferSafe(transferPointsStub, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_AMOUNT_PROVIDED")
            }
        })

        it("Should reject if code is invalid", async () => {
            mockData.code = null
            try {
                await processTransferSafe(transferPointsStub, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CODE_PROVIDED")
            }
        })


        it("Should reject if points could not be transfered", async () => {
            transferPointsStub = fake.rejects()
            try {
                await processTransferSafe(transferPointsStub, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_TRANSFER")
            }
        })

        it("Should resolve if points were transfered", async () => {
            const result = await processTransferSafe(transferPointsStub, mockData)
            expect(result).to.equal("POINTS_TRANSFERED_SUCCESSFULLY")
        })
    })
})