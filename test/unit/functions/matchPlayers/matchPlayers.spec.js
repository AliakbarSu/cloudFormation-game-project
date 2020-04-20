const {
    invalidCoordinatesError,
    failedToGetMaxDistanceError,
    failedToParseDataError,
    failedToPerformMatchPlayersOperationError,
    handlerSafe,
    constructBroadcastMessage
} = require('../../../../src/matchPlayers/matchPlayers')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('MatchPlayers', function() {
    let parserStub, mockLatitude, mockLongitude,
    mockCategory, mockLanguage, mockLevel,
    mockPid, mockMaxDistance, mockSQS_REQUEST_QUE_URL,
    mockConnectionId, searchForPlayersStub, broadcastMessageStub,
    markPlayersAsPlayingStub, addRequestStub, addRequestSqsStub,
    mockEvent, mockContext, mockMessage, mockData, mockPlayers, mockRequestId

    this.beforeEach(() => {
        mockLatitude = 123
        mockLongitude = 123
        mockCategory = "test_category"
        mockLanguage = "test_language"
        mockLevel = 2
        mockPid = "test_pid"
        mockMessage = "test_message"
        mockData = "test_data"
        mockMaxDistance = 12
        mockSQS_REQUEST_QUE_URL = "http://test.com"
        mockConnectionId = "test_connection_id"
        mockPlayers = [{_id: mockPid, connectionId: mockConnectionId}]
        mockRequestId = "test_request_id"
        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
        mockEvent = {
            detail: {
                fullDocument: {
                    category: mockCategory,
                    language: mockLanguage,
                    level: mockLevel,
                    _id: mockPid,
                    connectionId: mockConnectionId,
                    location: {coordinates: [mockLatitude, mockLongitude]}
                }
            }
        }
        searchForPlayersStub = fake.resolves(mockPlayers)
        broadcastMessageStub = fake.resolves()
        markPlayersAsPlayingStub = fake.resolves()
        addRequestStub = fake.resolves(mockRequestId)
        addRequestSqsStub = fake.resolves()
        parserStub = (arg) => arg
    })

    describe("invalidCoordinatesError", function() {
        it("Should return an error object", () => {
            expect(invalidCoordinatesError().message).to.equal("USER_DATA_CONTAINS_INVALID_COORDINATES")
        })
    })

    describe("failedToGetMaxDistanceError", function() {
        it("Should return an error object", () => {
            expect(failedToGetMaxDistanceError().message).to.equal("FAILED_TO_GET_MAX_DISTANCE_ENV_VARIABLE")
        })
    })

    describe("failedToParseDataError", function() {
        it("Should return an error object", () => {
            expect(failedToParseDataError().message).to.equal("FAILED_TO_PARSE_DATA")
        })
    })

    describe("failedToPerformMatchPlayersOperationError", function() {
        it("Should return an error object", () => {
            expect(failedToPerformMatchPlayersOperationError().message)
            .to.equal("FAILED_TO_COMPLETE_MATCH_PLAYERS")
        })
    })

    describe("constructBroadcastMessage", function() {
        it("Should reject if parsing fails", async () => {
            parserStub = fake.throws()
            try {
                await constructBroadcastMessage(parserStub, mockMessage, mockData)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PARSE_DATA")
            }
        })

        it("Should resolve to an json object", async () => {
            const testData = "test_data"
            parserStub = fake.returns(testData)
            const result = await constructBroadcastMessage(parserStub, mockMessage, mockData)
            expect(result).to.equal(testData)
            expect(parserStub.getCall(0).args[0].message).to.equal(mockMessage)
            expect(parserStub.getCall(0).args[0].data).to.equal(mockData)
        })
    })

    describe("handlerSafe", function() {
        it("Should reject if coordinates are missing", async () => {
            mockEvent.detail.fullDocument.location.coordinates = [mockLatitude]
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("USER_DATA_CONTAINS_INVALID_COORDINATES")
            }
        })

        it("Should reject if connection id is invalid", async () => {
            mockEvent.detail.fullDocument.connectionId = null
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CONNECTION_ID_PROVIDED")
            }
        })

        it("Should reject if latitude is invalid", async () => {
            mockEvent.detail.fullDocument.location.coordinates = [null, mockLongitude]
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_LATITUDE_PROVIDED")
            }
        })

        it("Should reject if longitude is invalid", async () => {
            mockEvent.detail.fullDocument.location.coordinates[1] = -1
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_LONGITUDE_PROVIDED")
            }
        })

        it("Should reject if category is invalid", async () => {
            mockEvent.detail.fullDocument.category = null
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CATEGORY_PROVIDED")
            }
        })

        it("Should reject if language is invalid", async () => {
            mockEvent.detail.fullDocument.language = null
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_LANGUAGE_PROVIDED")
            }
        })

        it("Should reject if level is invalid", async () => {
            mockEvent.detail.fullDocument.level = null
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_LEVEL_PROVIDED")
            }
        })

        it("Should reject if playerId is invalid", async () => {
            mockEvent.detail.fullDocument._id = null
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_PID_PROVIDED")
            }
        })

        it("Should reject if sqs que url is invalid", async () => {
            process.env.SQS_REQUEST_QUE_URL = null
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    null,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_URL_PROVIDED")
            }
        })

        it("Should reject if maxDistance is invalid", async () => {
            process.env.MAX_DISTANCE = null
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    null,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_MAX_DISTANCE_ENV_VARIABLE")
            }
        })

        it("Should reject if searchForPlayers fails", async () => {
            searchForPlayersStub = fake.rejects()
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_COMPLETE_MATCH_PLAYERS")
            }
        })

        it("Should resolve to null if no players were found", async () => {
            searchForPlayersStub = fake.resolves([])
            const result = await handlerSafe(
                            searchForPlayersStub,
                            broadcastMessageStub,
                            markPlayersAsPlayingStub,
                            addRequestStub,
                            addRequestSqsStub,
                            parserStub,
                            mockMaxDistance,
                            mockSQS_REQUEST_QUE_URL,
                            mockEvent,
                            mockContext)
            expect(result).to.be.null
        })

        it("Should pass the correct arguments to searchForPlayers", async () => {
            await handlerSafe(
                searchForPlayersStub,
                broadcastMessageStub,
                markPlayersAsPlayingStub,
                addRequestStub,
                addRequestSqsStub,
                parserStub,
                mockMaxDistance,
                mockSQS_REQUEST_QUE_URL,
                mockEvent,
                mockContext)
            expect(searchForPlayersStub.getCall(0).args[0]).to.equal(mockPid)
            expect(searchForPlayersStub.getCall(0).args[1]).to.equal(mockLatitude)
            expect(searchForPlayersStub.getCall(0).args[2]).to.equal(mockLongitude)
            expect(searchForPlayersStub.getCall(0).args[3]).to.equal(mockLanguage)
            expect(searchForPlayersStub.getCall(0).args[4]).to.equal(mockCategory)
            expect(searchForPlayersStub.getCall(0).args[5]).to.equal(mockLevel)
            expect(searchForPlayersStub.getCall(0).args[6]).to.equal(mockMaxDistance)
        })

        it("Should reject if searchForPlayers fails", async () => {
            searchForPlayersStub = fake.rejects()
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_COMPLETE_MATCH_PLAYERS")
            }
        })

        it("Should reject if broadcastMessages fails", async () => {
            broadcastMessageStub = fake.rejects()
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_COMPLETE_MATCH_PLAYERS")
            }
        })

        it("Should pass the correct arguments to broadcastMessages", async () => {
            await handlerSafe(
                searchForPlayersStub,
                broadcastMessageStub,
                markPlayersAsPlayingStub,
                addRequestStub,
                addRequestSqsStub,
                parserStub,
                mockMaxDistance,
                mockSQS_REQUEST_QUE_URL,
                mockEvent,
                mockContext)
            expect(broadcastMessageStub.getCall(0).args[0][0]).to.equal(mockConnectionId)
            expect(broadcastMessageStub.getCall(0).args[1].message).to.equal("TEST_REQUEST")
            expect(broadcastMessageStub.getCall(0).args[1].data).to.equal("TEST_DATA")
        })

        it("Should reject if markPlayersAsPlaying fails", async () => {
            markPlayersAsPlayingStub = fake.rejects()
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_COMPLETE_MATCH_PLAYERS")
            }
        })

        it("Should pass the correct arguments to markPlayersAsPlaying", async () => {
            await handlerSafe(
                searchForPlayersStub,
                broadcastMessageStub,
                markPlayersAsPlayingStub,
                addRequestStub,
                addRequestSqsStub,
                parserStub,
                mockMaxDistance,
                mockSQS_REQUEST_QUE_URL,
                mockEvent,
                mockContext)
            expect(markPlayersAsPlayingStub.getCall(0).args[0][0]).to.equal(mockPid)
        })

        it("Should reject if addRequest fails", async () => {
            addRequestStub = fake.rejects()
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_COMPLETE_MATCH_PLAYERS")
            }
        })

        it("Should pass the correct arguments to addRequest", async () => {
            await handlerSafe(
                searchForPlayersStub,
                broadcastMessageStub,
                markPlayersAsPlayingStub,
                addRequestStub,
                addRequestSqsStub,
                parserStub,
                mockMaxDistance,
                mockSQS_REQUEST_QUE_URL,
                mockEvent,
                mockContext)
            expect(addRequestStub.getCall(0).args[0][0].pid).to.equal(mockPid)
        })

        it("Should reject if addRequestSqs fails", async () => {
            addRequestSqsStub = fake.rejects()
            try {
                await handlerSafe(
                    searchForPlayersStub,
                    broadcastMessageStub,
                    markPlayersAsPlayingStub,
                    addRequestStub,
                    addRequestSqsStub,
                    parserStub,
                    mockMaxDistance,
                    mockSQS_REQUEST_QUE_URL,
                    mockEvent,
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_COMPLETE_MATCH_PLAYERS")
            }
        })

        it("Should pass the correct arguments to addRequestSqs", async () => {
            await handlerSafe(
                searchForPlayersStub,
                broadcastMessageStub,
                markPlayersAsPlayingStub,
                addRequestStub,
                addRequestSqsStub,
                parserStub,
                mockMaxDistance,
                mockSQS_REQUEST_QUE_URL,
                mockEvent,
                mockContext)
            expect(addRequestSqsStub.getCall(0).args[0]).to.equal(mockSQS_REQUEST_QUE_URL)
            expect(addRequestSqsStub.getCall(0).args[1]).to.equal(mockRequestId)
            expect(addRequestSqsStub.getCall(0).args[2][0]).to.equal(mockPid)
        })


        it("Should create a new request if everying went well", async () => {
            const result = await handlerSafe(
                            searchForPlayersStub,
                            broadcastMessageStub,
                            markPlayersAsPlayingStub,
                            addRequestStub,
                            addRequestSqsStub,
                            parserStub,
                            mockMaxDistance,
                            mockSQS_REQUEST_QUE_URL,
                            mockEvent,
                            mockContext)
            expect(result).to.equal("NEW_REQUEST_ADDED")
        })
    })



})