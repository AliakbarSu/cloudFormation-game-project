const {
    processResultSafe,
    failedToConvertObjectToArrayFormError,
    failedToGetQuestionsError,
    failedToProcessResultError,
    failedToSchedulePointsTransferError,
    failedToGetPlayerConnectionIdsError,
    failedToGetPlayersError, 
    biasOutOfRangeError,
    constructGameResultMessage,
    convertObjectToArrayForm,
    mapCorrectAnswersToQuestion,
    assignScoreToPlayers,
    applyBiasedSelection,
    compareByReduce,
    desideFinalWinner,
    compareResults,
    mapPlayersToQuestions,
    calculateNumberOfCorrectAnswers
} = require('../../../../src/processResults/processResult')

const chai = require('chai');
const expect = chai.expect 
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("processResult::processResult", function() {
    let converterStub, mockQuestions, broadcastMessagesStub,
    getGameStub, mockPlayers, transferPointsStub, mockGameId,
    getPlayersConIdsStub, mockConnectionIds, mockMessage,
    mockData, getPlayersPointsStub

    this.beforeEach(() => {
        mockGameId = "test_game"
        mockConnectionIds = ["connection1", "connection2"]
        mockMessage = "test_message"
        mockData = "test_data"
        mockPlayers = {
            playerOne: {points: 12, _id: "playerOne"},
            playerTwo: {points: 10, _id: "playerTwo"}
        }
        mockQuestions = {
            questionOne: {
                fetched: true,
                fetched_at: 12,
                answers: {
                    answer1: { isCorrect: true },
                    answer2: { isCorrect: true }
                },
                submitted_answers: {
                    playerOne: {
                        answers: ["answer1", "answer2"],
                        submitted_at: 15
                    },
                    playerTwo: {
                        answers: ["answer1"],
                        submitted_at: 18
                    }
                }
            },
            questionTwo: {
                fetched: true,
                fetched_at: 20,
                answers: {
                    answer1: { isCorrect: true },
                    answer2: { isCorrect: false }
                },
                submitted_answers: {
                    playerOne: {
                        answers: ["answer1"],
                        submitted_at: 24
                    },
                    playerTwo: {
                        answers: ["answer1"],
                        submitted_at: 23
                    }
                }
            }
        }
        
        converterStub = obj => Object.keys(obj)
        broadcastMessagesStub = fake.resolves()
        transferPointsStub = fake.resolves()
        getPlayersPointsStub = fake.resolves(Object.keys(mockPlayers)
        .map(key => ({...mockPlayers[key]})))
        getPlayersConIdsStub = fake.resolves(mockConnectionIds)
        getGameStub = fake.resolves({
            Items: [{questions: mockQuestions, players: mockPlayers}]
        })
    })

    describe("biasOutOfRangeError", function() {
        it("Should return an error object", () => {
            expect(biasOutOfRangeError().message).to.equal("BIAS_IS_OUT_OF_RANGE")
        })
    })

    describe("failedToConvertObjectToArrayFormError", function() {
        it("Should return an error object", () => {
            expect(failedToConvertObjectToArrayFormError().message)
            .to.equal("FAILED_TO_CONVERT_OBJECT_TO_ARRAY_FORM")
        })
    })

    describe("failedToGetPlayerConnectionIdsError", function() {
        it("Should return an error object", () => {
            expect(failedToGetPlayerConnectionIdsError().message)
            .to.equal("FAILED_TO_GET_PLAYERS_CONNECTION_IDS")
        })
    })

    describe("failedToGetPlayersError", function() {
        it("Should return an error object", () => {
            expect(failedToGetPlayersError().message)
            .to.equal("FAILED_TO_GET_PLAYERS")
        })
    })

    describe("failedToGetQuestionsError", function() {
        it("Should return an error object", () => {
            expect(failedToGetQuestionsError().message)
            .to.equal("FAILED_TO_GET_QUESTIONS")
        })
    })

    describe("failedToProcessResultError", function() {
        it("Should return an error object", () => {
            expect(failedToProcessResultError().message)
            .to.equal("FAILED_TO_PROCESS_RESULT")
        })
    })

    describe("failedToSchedulePointsTransferError", function() {
        it("Should return an error object", () => {
            expect(failedToSchedulePointsTransferError().message)
            .to.equal("FAILED_TO_SCHEDULE_POINTS_TRANSFER")
        })
    })

    describe("desideFinalWinner", function() {
        it("Should return player with the highest points if there are more than two", async () => {
            getPlayersPointsStub = fake.resolves([
                {_id: "test1", points: 5}, 
                {_id: "test2", points: 10}
            ])
            const mockWinners = [{_id: "test1"}, {_id: "test2"}]

            const result = await desideFinalWinner(mockWinners, getPlayersPointsStub)
            expect(result._id).to.equal("test2")
        })

        it("Should return the only player if there is only one", async () => {
            const mockWinners = [{_id: "test1"}]
            const result = await desideFinalWinner(mockWinners, getPlayersPointsStub)
            expect(result._id).to.equal("test1")
        })
    })

    describe("applyBiasedSelection", function() {
        const mockChoises = [{_id: "testId1"}, {_id: "testId2"}]
        it("Should handle error gracefully if playerId does not match any players", async () => {
            try {
                await applyBiasedSelection(mockChoises, "testId3")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("BIAS_IS_OUT_OF_RANGE")
            }
        })

        it("Should return the correct player", async () => {
            const result = await applyBiasedSelection(mockChoises, "testId1")
            expect(result._id).to.equal("testId1")
        })
    })

    describe("compareByReduce", function() {
        const values = [{key: 2}, {key: 0.5}, {key: 1}]
        it("Should return object which has greatest key value", () => {
            const result = compareByReduce(values, "key", 1)
            expect(result[0]).to.deep.equal(values[0])
        })
        it("Should return object which has smallest key value", () => {
            const result = compareByReduce(values, "key", 0)
            expect(result[0]).to.deep.equal(values[1])
        })
        it("Should return both object if their key values are equal", () => {
            values[0].key = values[2].key
            const result = compareByReduce(values, "key", 1)
            expect(result.length).to.equal(2)
            expect(result[0]).to.deep.equal(values[0])
            expect(result[1]).to.deep.equal(values[2])
        })

        it("Should return all object if their key values are equal", () => {
            values[0].key = values[1].key
            values[2].key = values[1].key
            const result = compareByReduce(values, "key", 1)
            expect(result.length).to.equal(3)
            expect(result).to.deep.equal(values)
        })
    })

    describe("construcGameResultMessage", function() {
        it("Should return an object containing message and data properties", () => {
            const result = constructGameResultMessage(mockMessage, mockData)
            expect(result.message).to.equal(mockMessage)
            expect(result.data).to.equal(mockData)
        })
    })

    describe("mapCorrectAnswersToQuestion", function() {
        const questions = [{answers: [{isCorrect: true}, {isCorrect: true}]}]
        it("Should attach an array to each question containing the correct answers", () => {
            const result = mapCorrectAnswersToQuestion(questions)
            expect(result[0].correctAnswers.length).to.equal(2)
        })
    })

    describe("mapPlayersToQuestions", function() {
        const questions = [
            {
              playerOne: {
                qid: "questionOneId",
                gotCorrect: true
              },
              playerTwo: {
                qid: "fjskfjsfj",
                gotCorrect: true
              }
            },
            {
              playerOne: {
                qid: "fjskfjsfj",
                gotCorrect: true
              },
              playerTwo: {
                qid: "fjskfjsfj",
                gotCorrect: false
              }
            }
          ]
        it("Should return an array containing players along with question data", async () => {
            const result = await mapPlayersToQuestions(converterStub, questions)
            expect(result.length).to.equal(2)
            expect(result[0]._id).to.equal("playerOne")
            expect(result[0].data[0].qid).to.equal("questionOneId")
        })
    })

    describe("convertObjectToArrayForm", function() {
        it("Should handle error gracefully if getting object keys fails", async () => {
            converterStub = fake.throws()
            try {
                await convertObjectToArrayForm(converterStub, mockQuestions)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CONVERT_OBJECT_TO_ARRAY_FORM")
            }
        })

        it("Should return an array of questions", async () => {
            const result = await convertObjectToArrayForm(converterStub, mockQuestions)
            expect(result.length).to.equal(2)
        })

        it("Should set object key as the id parameters", async () => {
            const result = await convertObjectToArrayForm(converterStub, mockQuestions)
            expect(result[0]._id).to.equal("questionOne")
        })
    })

    describe("assignScoreToPlayers", function() {
        const players = [
            {
                _id: "playerOne",
                data: [
                    { summary: {answeredIn: 2, gotCorrect: true }},
                    { summary: {answeredIn: 1, gotCorrect: false }}
                ]
            },
            {
                _id: "playerTwo",
                data: [
                    { summary: {answeredIn: 2, gotCorrect: true  }},
                    { summary: {answeredIn: 1, gotCorrect: true  }}
                ]
            }
        ]

        it("Should game playerOne score of 0.5", () => {
            const result = assignScoreToPlayers(players)
            expect(result[0].score).to.equal(0.5)
        })

        it("Should game playerTwo score of 1", () => {
            const result = assignScoreToPlayers(players)
            expect(result[1].score).to.equal(1)
        })
        
    })

    describe("compareResult", function() {
        const scores = [
            {
                _id: "PlayerOne",
                score: 2,
                averageAnsweredTime: 0.5
            },
            {
                _id: "PlayerTwo",
                score: 2,
                averageAnsweredTime: 0.4
            },
            {
                _id: "PlayerThree",
                score: 2,
                averageAnsweredTime: 0.4
            }
          ]
        it("Should return player with the highest score", () => {
            const result = compareResults(scores)
            expect(result[0]._id).to.equal("PlayerTwo")
        })
    })

    describe("calculateNumberOfCorrectAnswers", function() {
        const questions = [
            {
                _id: "questionOne",
                fetched_at: 9,
                correctAnswers: ["answer1", "answer2"],
                answers: [{_id: "answer1"}, {_id: "answer2"}],
                submitted_answers: {
                    playerOne: {
                        answers: ["answer1", "answer2"],
                        submitted_at: 11
                    },
                    playerTwo: {
                        answers: ["answer1", "answer3"],
                        submitted_at: 32
                    }
                }
            }
        ]

        it("Should calculate the correct response time", async () => {
            const result = await Promise.all(calculateNumberOfCorrectAnswers(converterStub, questions))
            const questionOne = result[0]
            expect(questionOne.playerOne.summary.answeredIn).to.equal(2)
        })

        it("Should return the correct summary for the player", async () => {
            const result = await Promise.all(calculateNumberOfCorrectAnswers(converterStub, questions))
            const questionOne = result[0]
            expect(questionOne.playerOne.summary.gotCorrect).to.be.true
            expect(questionOne.playerOne.summary.correctAnswers).to.deep.equal(["answer1", "answer2"])
            expect(questionOne.playerTwo.summary.gotCorrect).to.be.false
            expect(questionOne.playerTwo.summary.correctAnswers).to.deep.equal(["answer1"])
            expect(questionOne.playerOne.summary.allAnswers).to.deep.equal(["answer1", "answer2"])
        })
    })

    describe("processResultSafe", function() {
        it("Should handle invalid game id", async () => {
            mockGameId = null
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_GAME_ID_PROVIDED")
            }
        })

        it("Should handle error gracefully if getting game fails", async () => {
            getGameStub = fake.rejects()
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_RESULT")
            }
        })

        it("Should return error if the game contains no questions", async () => {
            getGameStub = fake.resolves({
                Items: [{questions: null, players: mockPlayers}]
            })
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_QUESTIONS")
            }
        })

        it("Should return error if the game contains no players", async () => {
            getGameStub = fake.resolves({
                Items: [{questions: mockQuestions, players: null}]
            })
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_PLAYERS")
            }
        })

        it("Should handle error gracefully if getting players connection ids fails", async () => {
            getPlayersConIdsStub = fake.rejects()
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_RESULT")
            }
        })

        it("Should handle error gracefully if no connection ids were found", async () => {
            getPlayersConIdsStub = fake.resolves([])
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_GET_PLAYERS_CONNECTION_IDS")
            }
        })

        it("Should get connection ids for all players", async () => {
            await processResultSafe(
                getGameStub,
                broadcastMessagesStub,
                getPlayersConIdsStub,
                getPlayersPointsStub,
                transferPointsStub,
                converterStub,
                mockGameId
            )
            expect(getPlayersConIdsStub.getCall(0).args[0]).to.deep.equal(["playerOne", "playerTwo"])
        })

        it("Should handle error gracefully if broadcasting message fails", async () => {
            broadcastMessagesStub = fake.rejects()
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_PROCESS_RESULT")
            }
        })

        it("Should handle error gracefully if scheduling points transfer fails", async () => {
            transferPointsStub = fake.rejects()
            try {
                await processResultSafe(
                    getGameStub,
                    broadcastMessagesStub,
                    getPlayersConIdsStub,
                    getPlayersPointsStub,
                    transferPointsStub,
                    converterStub,
                    mockGameId
                )
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_SCHEDULE_POINTS_TRANSFER")
            }
        })

        it("Should calculate results successfully and return the correct winner player", async () => {
            getPlayersPointsStub = fake.resolves(Object.keys(mockPlayers)
            .map(key => ({...mockPlayers[key]})))
            const result = await processResultSafe(
                getGameStub,
                broadcastMessagesStub,
                getPlayersConIdsStub,
                getPlayersPointsStub,
                transferPointsStub,
                converterStub,
                mockGameId
            )
            expect(result._id).to.equal("playerOne")
        })

        it("Should apply the correct bias if players are draw", async () => {
            mockPlayers.playerTwo.points = 100

            mockQuestions.questionOne
            .submitted_answers.playerTwo.submitted_at = mockQuestions.questionOne
            .submitted_answers.playerOne.submitted_at

            mockQuestions.questionOne
            .submitted_answers.playerTwo.answers = mockQuestions.questionOne
            .submitted_answers.playerOne.answers

            getPlayersPointsStub = fake.resolves(Object.keys(mockPlayers)
            .map(key => ({...mockPlayers[key]})))

            getGameStub = fake.resolves({
                Items: [{questions: mockQuestions, players: mockPlayers}]
            })
            const result = await processResultSafe(
                getGameStub,
                broadcastMessagesStub,
                getPlayersConIdsStub,
                getPlayersPointsStub,
                transferPointsStub,
                converterStub,
                mockGameId
            )
            expect(result._id).to.equal("playerTwo")
            expect(result.data[0].summary.qid).to.equal("questionOne")
            expect(result.averageAnsweredTime).not.to.be.NaN
        })
    })

    
})