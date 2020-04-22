const {
    failedToAddRequestError,
    failedToConvertIdsToJsonError,
    failedToGetSendMessageMethodError,
    failedToScheduleNextQuestionError,
    failedToScheduleResultError,
    failedToSchedulePointsTransferError,
    invalidParamsError,
    invalidPlayerIdsError,
    invalidSendMethodError,
    constructQuestionObject,
    constructRequestObject,
    constructPointsTransferObject,
    convertIdsToJson,
    sendMessage,
    addRequestSafe,
    scheduleNextQuestionSafe,
    scheduleResultSafe, 
    validatePlayerIds,
    schedulePointsTransferSafe
} = require('../../../src/opt/nodejs/connectors/sqs.connector')


const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)



describe("SQS Connector", function() {
    let mockDelaySeconds, mockRequestId, mockPlayerIds,
    mockGameId, mockMessageBody, mockQueueUrl, sendMessageStub,
    sqsStub, stringifierStub, mockPlayerIdsJson, mockResponse,
    mockAmount, mockPlayerId, mockCode

    this.beforeEach(() => {
        mockDelaySeconds = 2
        mockRequestId = "test_request_id"
        mockPlayerIds = ["id1", "id2"]
        mockPlayerIdsJson = '["id1", "id2"]'
        mockGameId = "test_game"
        mockMessageBody = "test_message_body"
        mockQueueUrl = "http://test@url.com"
        mockResponse = "test_response"
        mockAmount = 10
        mockCode = "to"
        mockPlayerId = "test_player_id"
        stringifierStub = fake.returns(mockPlayerIdsJson)
        sendMessageStub = fake.yields(null, mockResponse)
        sqsStub = {
            sendMessage: sendMessageStub
        }
    })


    describe("failedToAddRequestError", function() {
        it("Should create a new error object", () => {
            expect(failedToAddRequestError().message)
            .to.equal("FAILED_TO_ADD_REQUEST")
        })
    })

    describe("failedToConvertIdsToJsonError", function() {
        it("Should create a new error object", () => {
            expect(failedToConvertIdsToJsonError().message)
            .to.equal("FAILED_TO_CONVERT_IDS_TO_JSON")
        })
    })

    describe("failedToGetSendMessageMethodError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetSendMessageMethodError().message)
            .to.equal("FAILED_TO_GET_SEND_MESSAGE_METHOD")
        })
    })

    describe("failedToSchedulePointsTransferError", function() {
        it("Should create a new error object", () => {
            expect(failedToSchedulePointsTransferError().message)
            .to.equal("FAILED_TO_SCHEDULE_POINTS_TRANSFER")
        })
    })

    describe("failedToScheduleNextQuestionError", function() {
        it("Should create a new error object", () => {
            expect(failedToScheduleNextQuestionError().message)
            .to.equal("FAILED_TO_SCHEDULE_NEXT_QUESTION")
        })
    })

    describe("failedToScheduleResultError", function() {
        it("Should create a new error object", () => {
            expect(failedToScheduleResultError().message)
            .to.equal("FAILED_TO_SCHEDULE_RESULT")
        })
    })

    describe("invalidParamsError", function() {
        it("Should create a new error object", () => {
            expect(invalidParamsError().message)
            .to.equal("INVALID_PARAMS_ERROR")
        })
    })

    describe("invalidPlayerIdsError", function() {
        it("Should create a new error object", () => {
            expect(invalidPlayerIdsError().message)
            .to.equal("PLAYER_IDS_ARRAY_CONTAINS_INVALID_ID")
        })
    })

    describe("invalidParamsError", function() {
        it("Should create a new error object", () => {
            expect(invalidParamsError().message)
            .to.equal("INVALID_PARAMS_ERROR")
        })
    })

    describe("invalidSendMethodError", function() {
        it("Should create a new error object", () => {
            expect(invalidSendMethodError().message)
            .to.equal("INVALID_SEND_METHOD")
        })
    })

    describe("constructRequestObject", function() {
        it("Should return a request object", () => {
            const obj = constructRequestObject(
                mockDelaySeconds,
                mockRequestId,
                mockPlayerIds,
                mockMessageBody,
                mockQueueUrl)
            expect(obj.DelaySeconds).to.equal(mockDelaySeconds)
            expect(obj.MessageAttributes.requestId.StringValue).to.equal(mockRequestId)
            expect(obj.MessageAttributes.playerIds.StringValue).to.deep.equal(mockPlayerIds)
            expect(obj.MessageBody).to.equal(mockMessageBody)
            expect(obj.QueueUrl).to.equal(mockQueueUrl)
        })
    })

    describe("constructQuestionObject", function() {
        it("Should return a question object", () => {
            const obj = constructQuestionObject(
                mockDelaySeconds,
                mockGameId,
                mockMessageBody,
                mockQueueUrl)
            expect(obj.DelaySeconds).to.equal(mockDelaySeconds)
            expect(obj.MessageAttributes.gameId.StringValue).to.equal(mockGameId)
            expect(obj.MessageBody).to.equal(mockMessageBody)
            expect(obj.QueueUrl).to.equal(mockQueueUrl)
        })
    })

    describe("constructPointsTransferObject", function() {
        it("Should return a question object", () => {
            const obj = constructPointsTransferObject(
                mockDelaySeconds,
                mockCode,
                mockPlayerId,
                mockAmount,
                mockMessageBody,
                mockQueueUrl)
            expect(obj.DelaySeconds).to.equal(mockDelaySeconds)
            expect(obj.MessageAttributes.playerId.StringValue).to.equal(mockPlayerId)
            expect(obj.MessageAttributes.code.StringValue).to.equal(mockCode.toUpperCase())
            expect(obj.MessageAttributes.amount.StringValue).to.equal(mockAmount)
            expect(obj.MessageBody).to.equal(mockMessageBody)
            expect(obj.QueueUrl).to.equal(mockQueueUrl)
        })
    })

    describe("convertIdsToJson", function() {
        it("Should reject if stringifier fails", async () => {
            stringifierStub = fake.throws()
            try {
                await convertIdsToJson(stringifierStub, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CONVERT_IDS_TO_JSON")
            }
        })

        it("Should resolve to an array converted to a string", async () => {
            const result = await convertIdsToJson(stringifierStub, mockPlayerIds)
            expect(result).to.equal(mockPlayerIdsJson)
        })
    })

    describe("validatePlayerIds", function() {
        it("Should return false when playerId array contains invalid ids", () => {
            mockPlayerIds = ["", "id2"]
            expect(validatePlayerIds(mockPlayerIds)).to.be.false
        })
        it("Should return true", () => {
            expect(validatePlayerIds(mockPlayerIds)).to.be.true
        })
    })

    describe("sendMessage", function() {
        let mockParams

        this.beforeEach(() => {
            mockParams = "test_params"
        })

        it("Should reject if send is invalid", async () => {
            try {
                await sendMessage(null, mockParams)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_SEND_METHOD")
            }
        })

        it("Should reject if params is invalid", async () => {
            try {
                await sendMessage(sendMessageStub, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_PARAMS_ERROR")
            }
        })

        it("Should reject if send fails", async () => {
            const error = new Error("test_error")
            sendMessageStub = fake.yields(error)
            try {
                await sendMessage(sendMessageStub, mockParams)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(error.message)
            }
        })

        it("Should resolve if send successed", async () => {
            const result = await sendMessage(sendMessageStub, mockParams)
            expect(result).to.equal(mockResponse)
        })
    })

    describe("addRequestSafe", function() {
        it("Should reject if queueUrl is invalid", async () => {
            try {
                await addRequestSafe(sqsStub, stringifierStub, null, mockRequestId, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_QUEUE_URL_PROVIDED")
            }
        })

        it("Should reject if requestId is invalid", async () => {
            try {
                await addRequestSafe(sqsStub, stringifierStub, mockQueueUrl, null, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_REQUEST_ID_PROVIDED")
            }
        })

        it("Should reject if playerIds is invalid", async () => {
            try {
                await addRequestSafe(sqsStub, stringifierStub, mockQueueUrl, mockRequestId, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("PLAYER_IDS_ARRAY_CONTAINS_INVALID_ID")
            }
        })

        it("Should reject if sendMessage is invalid", async () => {
            sqsStub = {
                sendMessage: null
            }
            try {
                await addRequestSafe(sqsStub, stringifierStub, mockQueueUrl, mockRequestId, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_SEND_MESSAGE_METHOD")
            }
        })

        it("Should reject if sendMessage fails", async () => {
            sqsStub = {
                sendMessage: fake.yields("error")
            }
            try {
                await addRequestSafe(sqsStub, stringifierStub, mockQueueUrl, mockRequestId, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_ADD_REQUEST")
            }
        })

        it("Should resolve if message was sent", async () => {
            const result = await addRequestSafe(sqsStub, stringifierStub, mockQueueUrl, mockRequestId, mockPlayerIds)
            expect(result).to.equal(mockResponse)
        })
    })

    describe("scheduleNextQuestionSafe", function() {
        it("Should reject if queueUrl is invalid", async () => {
            try {
                await scheduleNextQuestionSafe(sqsStub, null, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_QUEUE_URL_PROVIDED")
            }
        })

        it("Should reject if gameId is invalid", async () => {
            try {
                await scheduleNextQuestionSafe(sqsStub, mockQueueUrl, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_GAME_ID_PROVIDED")
            }
        })

        it("Should reject if sendMessage is invalid", async () => {
            sqsStub = {
                sendMessage: null
            }
            try {
                await scheduleNextQuestionSafe(sqsStub, mockQueueUrl, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_SEND_MESSAGE_METHOD")
            }
        })

        it("Should reject if sendMessage fails", async () => {
            sqsStub = {
                sendMessage: fake.yields("error")
            }
            try {
                await scheduleNextQuestionSafe(sqsStub, mockQueueUrl, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_SCHEDULE_NEXT_QUESTION")
            }
        })

        it("Should resolve if message was sent", async () => {
            const result = await scheduleNextQuestionSafe(sqsStub, mockQueueUrl, mockGameId)
            expect(result).to.equal(mockResponse)
        })
    })

    describe("scheduleResultSafe", function() {
        it("Should reject if queueUrl is invalid", async () => {
            try {
                await scheduleResultSafe(sqsStub, null, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_QUEUE_URL_PROVIDED")
            }
        })

        it("Should reject if gameId is invalid", async () => {
            try {
                await scheduleResultSafe(sqsStub, mockQueueUrl, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_GAME_ID_PROVIDED")
            }
        })

        it("Should reject if sendMessage is invalid", async () => {
            sqsStub = {
                sendMessage: null
            }
            try {
                await scheduleResultSafe(sqsStub, mockQueueUrl, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_SEND_MESSAGE_METHOD")
            }
        })

        it("Should reject if sendMessage fails", async () => {
            sqsStub = {
                sendMessage: fake.yields("error")
            }
            try {
                await scheduleResultSafe(sqsStub, mockQueueUrl, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_SCHEDULE_RESULT")
            }
        })

        it("Should resolve if message was sent", async () => {
            const result = await scheduleResultSafe(sqsStub, mockQueueUrl, mockGameId)
            expect(result).to.equal(mockResponse)
        })
    })

    describe("schedulePointsTransferSafe", function() {
        it("Should reject if queueUrl is invalid", async () => {
            mockQueueUrl = null
            try {
                await schedulePointsTransferSafe(sqsStub, mockQueueUrl, mockCode, mockPlayerId, mockAmount)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_QUEUE_URL_PROVIDED")
            }
        })

        it("Should reject if code is invalid", async () => {
            mockCode = null
            try {
                await schedulePointsTransferSafe(sqsStub, mockQueueUrl, mockCode, mockPlayerId, mockAmount)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CODE_PROVIDED")
            }
        })

        it("Should reject if playerId is invalid", async () => {
            mockPlayerId = null
            try {
                await schedulePointsTransferSafe(sqsStub, mockQueueUrl, mockCode, mockPlayerId, mockAmount)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_PID_PROVIDED")
            }
        })

        it("Should reject if amount is invalid", async () => {
            mockAmount = null
            try {
                await schedulePointsTransferSafe(sqsStub, mockQueueUrl, mockCode, mockPlayerId, mockAmount)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_AMOUNT_PROVIDED")
            }
        })

        it("Should reject if sendMessage is invalid", async () => {
            sqsStub = {
                sendMessage: null
            }
            try {
                await schedulePointsTransferSafe(sqsStub, mockQueueUrl, mockCode, mockPlayerId, mockAmount)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_SEND_MESSAGE_METHOD")
            }
        })

        it("Should reject if sendMessage fails", async () => {
            sqsStub = {
                sendMessage: fake.yields("error")
            }
            try {
                await schedulePointsTransferSafe(sqsStub, mockQueueUrl, mockCode, mockPlayerId, mockAmount)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_SCHEDULE_POINTS_TRANSFER")
            }
        })

        it("Should resolve if message was sent", async () => {
            const result = await schedulePointsTransferSafe(sqsStub, mockQueueUrl, mockCode, mockPlayerId, mockAmount)
            expect(result).to.equal(mockResponse)
        })
    })
})

