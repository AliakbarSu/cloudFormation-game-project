const {
    invalidPlayersError,
    invalidQuestionsError,
    failedToProcessRecordsError,
    failedToUnmarshallDataError,
    unmarshallData,
    handlerSafe
} = require('../../../../src/processPendingGames/processPendingGames')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('Process Pending Games', function() {
    let mockRecords, mockQuestions, mockPlayers,
    mockRequestId, mockEvent, mockContext, unmarshallStub,
    processGameStub, mockGameId, mockResponse

    this.beforeEach(() => {
        mockPlayers = {playerOne: {}, playerTwo: {}}
        mockQuestions = [{id: "testId1"}, {id: "testId2"}]
        mockRequestId = "test_request_id"
        mockGameId = "test_game_id"
        mockResponse = "test_response"
        mockRecords = [{
            eventName: "INSERT",
            dynamodb: {
                Keys: {_id: {S: mockGameId }},
                NewImage: {
                    players: mockPlayers,
                    questions: mockQuestions,
                    request_id: mockRequestId
                }
            }
        }]
        mockEvent = {
            Records: mockRecords
        }
        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
        processGameStub = fake.resolves(mockResponse)
        unmarshallStub = arg => arg

    })

    describe("invalidPlayersError", function() {
        it("Should return an error object", () => {
            expect(invalidPlayersError().message).to.equal("INVALID_PLAYERS_IN_REQUEST_OBJECT")
        })
    })

    describe("invalidQuestionsError", function() {
        it("Should return an error object", () => {
            expect(invalidQuestionsError().message).to.equal("INVALID_QUESTIONS_IN_REQUEST_OBJECT")
        })
    })

    describe("failedToProcessRecordsError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessRecordsError().message).to.equal("FAILED_TO_PROCESS_RECORDS")
        })
    })

    describe("failedToUnmarshallDataError", function() {
        it("Should return an error object", () => {
            expect(failedToUnmarshallDataError().message).to.equal("FAILED_TO_UNMARSHALL_DATA")
        })
    })

    describe("unmarshallData", function() {
        it("Should reject if there is less than 1 player in the game object", async () => {
            mockRecords[0].dynamodb.NewImage.players = [mockPlayers[0]]
            try {
                await unmarshallData(unmarshallStub, mockRecords[0].dynamodb.NewImage, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_PLAYERS_IN_REQUEST_OBJECT")
            }
        })

        it("Should reject if there is not questions in the game object", async () => {
            mockRecords[0].dynamodb.NewImage.questions = []
            try {
                await unmarshallData(unmarshallStub, mockRecords[0].dynamodb.NewImage, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_QUESTIONS_IN_REQUEST_OBJECT")
            }
        })

        it("Should reject if request id is invalid", async () => {
            mockRecords[0].dynamodb.NewImage.request_id = null
            try {
                await unmarshallData(unmarshallStub, mockRecords[0].dynamodb.NewImage, mockGameId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_REQUEST_ID_PROVIDED")
            }
        })

        it("Should resolve to an object", async () => {
            const result = await unmarshallData(unmarshallStub, mockRecords[0].dynamodb.NewImage, mockGameId)
            expect(result.gameId).to.equal(mockGameId)
            expect(result.questions).to.deep.equal(mockQuestions)
            expect(result.players).to.deep.equal(mockPlayers)
            expect(result.requestId).to.equal(mockRequestId)
        })
    })

    describe("handlerSafe", function() {
        it("Should set callbackWaitsForEmptyEventLoop to false", async () => {
            await handlerSafe(unmarshallStub, processGameStub, mockEvent, mockContext)
            expect(mockContext.callbackWaitsForEmptyEventLoop).to.be.false
        })

        it("Should resolve if there is no record to be processed", async () => {
            mockEvent.Records = []
            const result = await handlerSafe(
                unmarshallStub, 
                processGameStub, 
                mockEvent, 
                mockContext)
            expect(result).to.equal("NO_RECORD_TO_PROCESS")
        })

        it("Should reject if unmarshalling all records fails", async () => {
            unmarshallStub = fake.throws()
            try {
                await handlerSafe(
                    unmarshallStub, 
                    processGameStub, 
                    mockEvent, 
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_UNMARSHALL_DATA")
            }
        })

        it("Should reject if none of the records were processed", async () => {
            const testError = new Error("TEST_ERROR")
            processGameStub = fake.rejects(testError)
            try {
                await handlerSafe(
                    unmarshallStub, 
                    processGameStub, 
                    mockEvent, 
                    mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(testError.message)
            }
        })

        it("Should resolve to an array of processed games", async () => {
            const result = await handlerSafe(
                            unmarshallStub, 
                            processGameStub, 
                            mockEvent, 
                            mockContext)
            expect(result).to.deep.equal([mockResponse])
        })
    })
})