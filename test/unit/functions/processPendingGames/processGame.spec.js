const {
    failedToGetPlayersIdsError,
    failedToProcessGameError,
    constructNewMessageObject,
    constructNewQuestionObject,
    getPlayersIds,
    processGameSafe
} = require('../../../../src/processPendingGames/processGame')



const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("ProcessGame", function() {
    let mockData, mockMessage, mockGameId, mockQuestions, mockPlayers,
    parserStub, getPlayersConIdsStub, broadcastMessagesStub,
    markQuestionAsFetchedStub, scheduleNextQuestionStub, mockGame

    this.beforeEach(() => {
        mockMessage = "test_message"
        mockData = "test_data"
        mockGameId = "test_game_id"
        mockQuestions = ["questionOne", "questionTwo"]
        mockPlayers = {playerOne: {}, playerTwo: {}}
        mockGame = {
            gameId: mockGameId,
            questions: mockQuestions
        }
        parserStub = arg => arg
        getPlayersConIdsStub = fake.resolves()
        broadcastMessagesStub = fake.resolves()
        markQuestionAsFetchedStub = fake.resolves()
        scheduleNextQuestionStub = fake.resolves()
    })

    describe("failedToGetPlayersIdsError", function() {
        it("Should return an error object", () => {
            expect(failedToGetPlayersIdsError().message).to.equal("FAILED_TO_GET_PLAYERS_IDS")
        })
    })

    describe("failedToProcessGameError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessGameError().message).to.equal("FAILED_TO_PROCESS_GAME")
        })
    })

    describe("constructNewMessageObject", function() {
        it("Should return an object containing message and data properties", () => {
            const result = constructNewMessageObject(mockMessage, mockData)
            expect(result.message).to.equal(mockMessage)
            expect(result.data).to.equal(mockData)
        })
    })

    describe("constructNewQuestionObject", function() {
        it("Should return an object containing gid and question properties", () => {
            const result = constructNewQuestionObject(mockGameId, mockQuestions[0])
            expect(result.gid).to.equal(mockGameId)
            expect(result.question).to.equal(mockQuestions[0])
        })
    })

    describe("getPlayersIds", function() {
        it("Should reject if parser fails", async () => {
            parserStub = fake.throws()
            try {
                await getPlayersIds(parserStub, mockPlayers)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_PLAYERS_IDS")
            }
        })

        it("Should resolve to an array of ids", async () => {
            const result = await getPlayersIds(parserStub, mockPlayers)
            expect(result).to.deep.equal(mockPlayers)  
        })
    })

    describe("processGameSafe", function() {
        it("Should reject if extracting players id fails", async () => {
            parserStub = fake.throws()
            try {
                await processGameSafe(
                    getPlayersConIdsStub,
                    broadcastMessagesStub,
                    markQuestionAsFetchedStub,
                    scheduleNextQuestionStub,
                    parserStub,
                    mockGame)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_GAME")
            }
        })

        it("Should reject if getting players connection ids fails", async () => {
            getPlayersConIdsStub = fake.rejects()
            try {
                await processGameSafe(
                    getPlayersConIdsStub,
                    broadcastMessagesStub,
                    markQuestionAsFetchedStub,
                    scheduleNextQuestionStub,
                    parserStub,
                    mockGame)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_GAME")
            }
        })

        it("Should resolve to an array containing failed processes", async () => {
            broadcastMessagesStub = fake.rejects()
            markQuestionAsFetchedStub = fake.rejects()
            scheduleNextQuestionStub = fake.rejects()
            const result = await processGameSafe(
                getPlayersConIdsStub,
                broadcastMessagesStub,
                markQuestionAsFetchedStub,
                scheduleNextQuestionStub,
                parserStub,
                mockGame
            )
            expect(result.length).to.equal(3)
        })
    })
})