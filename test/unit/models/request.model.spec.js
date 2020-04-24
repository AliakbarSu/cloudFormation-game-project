const {
    addRequestSafe,
    convertPlayersToObjectForm,
    extractRelaventProperties,
    validatePlayersData,
    invalidPlayersDataError,
    failedToAddRequestError,
    failedToFetchRequestError,
    failedToPerformAcceptRequestError,
    invalidRequestIdError,
    acceptRequestSafe,
    rejectRequestSafe,
    getPendingRequestSafe,
} = require('../../../src/opt/nodejs/models/request.model')

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("Request Model", function() {
    let IdGenerator, players, mockConnector, mockCurrentTime,
    mockRequestId

    this.beforeEach(() => {
        players = [{
            pid: "test_pid", 
            connectionId: "test_connectionId",
            level: 2, 
            category: "test_category", 
            language: "english"
        }]
        mockRequestId = "test_id"
        IdGenerator = fake.returns(mockRequestId)
        mockConnector = {
            put: fake.returns({promise: fake.resolves()}),
            query: fake.returns({promise: fake.resolves()}),
            update: fake.returns({promise: fake.resolves()})
        }
        mockCurrentTime = "242424"
    })

    describe("invalidPlayersDataError", function() {
        it("Should create a new error object", () => {
            expect(invalidPlayersDataError().message).to.equal("INVALID_PLAYERS_DATA")
        })
    })

    describe("failedToAddRequestError", function() {
        it("Should create a new error object", () => {
            expect(failedToAddRequestError().message).to.equal("FAILED_TO_ADD_REQUEST")
        })
    })

    describe("failedToFetchRequestError", function() {
        it("Should create a new error object", () => {
            expect(failedToFetchRequestError().message).to.equal("FAILED_TO_FETCH_REQUEST")
        })
    })

    describe("failedToPerformAcceptRequestError", function() {
        it("Should create a new error object", () => {
            expect(failedToPerformAcceptRequestError().message).to.equal("FAILED_TO_SET_PLAYER_ACCEPT_REQUEST_TO_TRUE")
        })
    })

    describe("invalidRequestIdError", function() {
        it("Should create a new error object", () => {
            expect(invalidRequestIdError().message).to.equal("INVALID_REQUEST_ID")
        })
    })

    describe("convertPlayersToObjectForm", function() {
        it("Should convert an array to object", () => {
            const pid = players[0].pid
            expect(convertPlayersToObjectForm(players)[pid].pid).to.equal(players[0].pid)
            expect(convertPlayersToObjectForm(players)[pid].connectionId).to.equal(players[0].connectionId)
            expect(convertPlayersToObjectForm(players)[pid].accepted).to.be.false
            expect(convertPlayersToObjectForm(players)[pid].accepted_at).to.be.null
        })
    })

    describe("extractRelaventProperties", function() {
        it("Should convert players array to an object with keys category, level, language", () => {
            expect(extractRelaventProperties(players).level).to.equal(players[0].level)
            expect(extractRelaventProperties(players).category).to.equal(players[0].category)
            expect(extractRelaventProperties(players).language).to.equal(players[0].language)
        })
    })

    describe("validatePlayersData", function() {
        it("Should return false if first players language property is invalid", () => {
            players[0].language = ""
            expect(validatePlayersData(players)).to.be.false
        })

        it("Should return false if first players level property is invalid", () => {
            players[0].level = ""
            expect(validatePlayersData(players)).to.be.false
        })

        it("Should return false if first players category property is invalid", () => {
            players[0].category = ""
            expect(validatePlayersData(players)).to.be.false
        })

        it("Should return false if first players connectionId property is invalid", () => {
            players[0].connectionId = ""
            expect(validatePlayersData(players)).to.be.false
        })

        it("Should return true if all players properties are valid", () => {
            expect(validatePlayersData(players)).to.be.true
        })
    })

    describe("getPendingRequestSafe", function() {
        let mockRequestId, mockTablename, mockFetchedRequest

        this.beforeEach(() => {
            mockRequestId = "test_request"
            mockTablename = "test_table"
            mockFetchedRequest = {Items: ["test"]}
            mockConnector.query = fake.returns({promise: fake.resolves(mockFetchedRequest)})
        })

        it("Should reject if request id is invalid", (done) => {
            expect(getPendingRequestSafe(mockConnector, mockTablename, "")).to.be.rejected.notify(done)
        })

        it("Should pass correct data to connector.query function", async () => {
            await getPendingRequestSafe(mockConnector, mockTablename, mockRequestId)
            expect(mockConnector.query.calledOnce).to.be.true
            expect(mockConnector.query.getCall(0).args[0].TableName).to.equal(mockTablename)
            expect(mockConnector.query.getCall(0).args[0].ExpressionAttributeValues[":id"])
            .to.equal(mockRequestId)
            expect(mockConnector.query.getCall(0).args[0].ExpressionAttributeValues[":active"])
            .to.be.true
        })

        it("Should return an array containing the request", (done) => {
            expect(getPendingRequestSafe(mockConnector, mockTablename, mockRequestId))
            .to.become(mockFetchedRequest.Items).notify(done)
        })

        it("Should reject if connector.query fails", (done) => {
            mockConnector.query = fake.returns({promise: fake.rejects()})
            expect(getPendingRequestSafe(mockConnector, mockTablename, mockRequestId))
            .to.be.rejected.notify(done)
        })
    })

    describe("acceptRequestSafe", function() {
        let mockRequestId, mockTablename, mockPlayerId

        this.beforeEach(() => {
            mockRequestId = "test_request"
            mockTablename = "test_table"
            mockPlayerId = "test_player"
            mockConnector.update = fake.returns({promise: fake.resolves()})
        })

        it("Should reject if request id is invalid", (done) => {
            expect(acceptRequestSafe(mockConnector, mockTablename, mockCurrentTime, "", mockPlayerId))
            .to.be.rejected.notify(done)
        })

        it("Should reject if playerId id is invalid", (done) => {
            expect(acceptRequestSafe(mockConnector, mockTablename, mockCurrentTime, mockRequestId, ""))
            .to.be.rejected.notify(done)
        })

        it("Should pass correct data to connector.update function", async () => {
            await acceptRequestSafe(
                mockConnector, 
                mockTablename, 
                mockCurrentTime, 
                mockRequestId, 
                mockPlayerId)

            expect(mockConnector.update.calledOnce).to.be.true
            expect(mockConnector.update.getCall(0).args[0].TableName).to.equal(mockTablename)
            expect(mockConnector.update.getCall(0).args[0].ExpressionAttributeValues[":acceptedAt"])
            .to.equal(mockCurrentTime)
            expect(mockConnector.update.getCall(0).args[0].ExpressionAttributeValues[":active"])
            .to.be.true
        })

        it("Should resolve to 'REQUEST_UPDATED_SUCCESSFULLY'", (done) => {
            expect(acceptRequestSafe(
                mockConnector, 
                mockTablename, 
                mockCurrentTime, 
                mockRequestId, 
                mockPlayerId)).to.become('REQUEST_UPDATED_SUCCESSFULLY').notify(done)
        })

        it("Should reject if connector.update fails", (done) => {
            mockConnector.update = fake.returns({promise: fake.rejects()})
            expect(acceptRequestSafe(
                mockConnector, 
                mockTablename, 
                mockCurrentTime, 
                mockRequestId, 
                mockPlayerId)).to.be.rejected.notify(done)
        })
    })

    describe("rejectRequestSafe", function() {
        let mockRequestId, mockTablename, mockPlayerId

        this.beforeEach(() => {
            mockRequestId = "test_request"
            mockTablename = "test_table"
            mockPlayerId = "test_player"
            mockConnector.update = fake.returns({promise: fake.resolves()})
        })

        it("Should reject if request id is invalid", (done) => {
            expect(rejectRequestSafe(mockConnector, mockTablename, mockCurrentTime, "", mockPlayerId))
            .to.be.rejected.notify(done)
        })

        it("Should reject if playerId id is invalid", (done) => {
            expect(rejectRequestSafe(mockConnector, mockTablename, mockCurrentTime, mockRequestId, ""))
            .to.be.rejected.notify(done)
        })

        it("Should pass correct data to connector.update function", async () => {
            await rejectRequestSafe(
                mockConnector, 
                mockTablename, 
                mockCurrentTime, 
                mockRequestId, 
                mockPlayerId)

            expect(mockConnector.update.calledOnce).to.be.true
            expect(mockConnector.update.getCall(0).args[0].TableName).to.equal(mockTablename)
            expect(mockConnector.update.getCall(0).args[0].ExpressionAttributeValues[":acceptedAt"])
            .to.be.null
            expect(mockConnector.update.getCall(0).args[0].ExpressionAttributeValues[":acceptedValue"])
            .to.be.false
        })

        it("Should resolve to 'REQUEST_UPDATED_SUCCESSFULLY'", (done) => {
            expect(rejectRequestSafe(
                mockConnector, 
                mockTablename, 
                mockCurrentTime, 
                mockRequestId, 
                mockPlayerId)).to.become('REQUEST_UPDATED_SUCCESSFULLY').notify(done)
        })

        it("Should reject if connector.update fails", (done) => {
            mockConnector.update = fake.returns({promise: fake.rejects()})
            expect(rejectRequestSafe(
                mockConnector, 
                mockTablename, 
                mockCurrentTime, 
                mockRequestId, 
                mockPlayerId)).to.be.rejected.notify(done)
        })
    })

    describe("addRequestSafe", function() {

        it("Should reject if players data is invalid", (done) => {
            players[0].language = ""
            expect(addRequestSafe(
                mockConnector, 
                IdGenerator, 
                "mock_table", 
                mockCurrentTime, 
                players)).to.be.rejected.notify(done)
        })

        it("Should resolve to request id", (done) => {
            expect(addRequestSafe(
                mockConnector, 
                IdGenerator, 
                "mock_table", 
                mockCurrentTime, 
                players)).to.become(mockRequestId).notify(done)
        })

        it("Should pass correct data to connector.put function", async () => {
            const pid = players[0].pid
            await addRequestSafe(
                mockConnector, 
                IdGenerator, 
                "mock_table", 
                mockCurrentTime, 
                players)

            expect(mockConnector.put.calledOnce).to.be.true
            expect(mockConnector.put.getCall(0).args[0].TableName).to.equal("mock_table")
            expect(mockConnector.put.getCall(0).args[0].Item.active).to.be.true
            expect(mockConnector.put.getCall(0).args[0].Item.created_at).to.equal(mockCurrentTime)
            expect(mockConnector.put.getCall(0).args[0].Item.updated_at).to.equal(mockCurrentTime)
            expect(mockConnector.put.getCall(0).args[0].Item.players[pid].pid)
            .to.equal(pid)
            expect(mockConnector.put.getCall(0).args[0].Item.players[pid].accepted)
            .to.be.false
            expect(mockConnector.put.getCall(0).args[0].Item.players[pid].accepted_at)
            .to.be.null
        })

        it("Should reject if adding request fails", (done) => {
            mockConnector.put = fake.returns({promise: fake.rejects()})
            expect(addRequestSafe(
                mockConnector, 
                IdGenerator, 
                "mock_table",
                mockCurrentTime, 
                players)).to.be.rejected.notify(done)
        })

    })
    
})