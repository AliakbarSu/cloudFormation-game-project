const {
    failedToConvertPlayersObjectToArrayFormError,
    failedToGetPendingRequestError,
    failedToProcessRequestError,
    constructGameParamsObject,
    convertPlayersObjectToArrayForm,
    processRequestSafe
} = require('../../../../src/processPendingRequests/processRequest')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("Process Request", function() {
    let mockSubject, mockLevel, mockLanguage, mockLimit,
    mockPlayers, converterStub, getPendingRequestStub,
    createGameStub, mockRequestId

    this.beforeEach(() => {
        mockSubject = "test_subject"
        mockLevel = 2
        mockLanguage = "test_language"
        mockLimit = 5
        mockRequestId = "test_request"
        mockPlayers = {playerOne: {accepted: true}, playerTwo: {}}
        converterStub = () => ["playerOne", "playerTwo"]
        getPendingRequestStub = fake.resolves({Items: [{
            category: mockSubject,
            level: mockLevel,
            players: mockPlayers,
            language: mockLanguage
        }]})
        createGameStub = fake.resolves()
    })

    describe("failedToConvertPlayersObjectToArrayFormError", function() {
        it("Should return an error object", () => {
            expect(failedToConvertPlayersObjectToArrayFormError().message)
            .to.equal("FAILED_TO_CONVERT_OBJECT_TO_ARRAY_FORM")
        })
    })

    describe("failedToGetPendingRequestError", function() {
        it("Should return an error object", () => {
            expect(failedToGetPendingRequestError().message)
            .to.equal("FAILED_TO_GET_PENDING_REQUEST_ERROR")
        })
    })

    describe("failedToProcessRequestError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessRequestError().message).to.equal("FAILED_TO_PROCESS_REQUEST")
        })
    })

    describe("convertPlayersObjectToArrayForm", function() {
        it("Should reject if converter fails", async () => {
            converterStub = fake.throws()
            try {
                await convertPlayersObjectToArrayForm(converterStub, mockPlayers)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CONVERT_OBJECT_TO_ARRAY_FORM")
            }
        })

        it("Should resolve to an array", async () => {
            const result = await convertPlayersObjectToArrayForm(converterStub, mockPlayers)
            expect(result.length).to.equal(2)
        })
    })

    describe("processRequest", function() {
        it("Should return an object", () => {
            const result = constructGameParamsObject(
                mockSubject, mockLevel, mockLanguage, mockLimit)
            expect(result.subject).to.equal(mockSubject)
            expect(result.language).to.equal(mockLanguage)
            expect(result.level).to.equal(mockLevel)
            expect(result.limit).to.equal(mockLimit)
        })

        it("Should reject if request id is invalid", async () => {
            mockRequestId = null
            try {
                await processRequestSafe(
                    getPendingRequestStub,
                    createGameStub,
                    converterStub,
                    mockLimit,
                    mockRequestId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_REQUEST_ID_PROVIDED")
            }
        })


        it("Should reject if no request were found", async () => {
            getPendingRequestStub = fake.resolves({Items: []})
            try {
                await processRequestSafe(
                    getPendingRequestStub,
                    createGameStub,
                    converterStub,
                    mockLimit,
                    mockRequestId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_PENDING_REQUEST_ERROR")
            }
        })

        it("Should resolve if there is no request to be processed", async () => {
            getPendingRequestStub = fake.resolves({Items: [{players: {}}]})
            const result = await processRequestSafe(
                    getPendingRequestStub,
                    createGameStub,
                    converterStub,
                    mockLimit,
                    mockRequestId
                )
            expect(result).to.equal("NO_PLAYERS_HAS_ACCEPTED_THE_REQUEST")
        })

        it("Should reject if new game could not be created", async () => {
            createGameStub = fake.rejects()
            try {
                await processRequestSafe(
                    getPendingRequestStub,
                    createGameStub,
                    converterStub,
                    mockLimit,
                    mockRequestId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_REQUEST")
            }
        })

        it("Should resolve if new game was created", async () => {
            const result = await processRequestSafe(
                    getPendingRequestStub,
                    createGameStub,
                    converterStub,
                    mockLimit,
                    mockRequestId
                )
            expect(result).to.equal("GAME_CREATED_SUCCESSFULLY")
        })
    })
})