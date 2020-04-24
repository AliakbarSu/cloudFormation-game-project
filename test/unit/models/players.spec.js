const {
    invalidSchemaError,
    failedToConvertIdToObjectIdError,
    failedToConvertIdsToObjectIdsError,
    failedToCreatePlayerError,
    failedToDeregisterConnectionIdError,
    failedToFindUserByEmailError,
    failedToFindUserByIdError,
    failedToGetPlayersConIdsError,
    failedToMarkPlayersAsPlayingError,
    failedToRegisterConnectionIdError,
    failedToSearchForPlayersError,
    failedToUpdatePlayerLocationError,
    failedToFindUserByConIdError,
    failedToGetPlayersPointsError,
    findUserByConIdSafe,
    findUserByEmailSafe,
    findUserByIdSafe,
    createPlayerSafe,
    updatePlayersLocationSafe,
    markPlayersAsPlayingSafe,
    getPlayersConIdsSafe,
    getPlayersPointsSafe,
    registerConnectionIdSafe,
    deregisterConnectionIdSafe,
    searchForPlayersSafe,
    convertIdToObjectId,
    convertIdsToObjectIds
} = require('../../../src/opt/nodejs/models/players.model')

const {
    invalidPidError,
    invalidSubError,
    invalidEmail,
    invalidPlayerIdsError,
    invalidConnectionIdError,
    invalidLatitudeError,
    invalidLongitudeError,
    invalidCategoryError,
    invalidLevelError,
    invalidLanguageError,
    invalidNumberError
} = require('../../../src/opt/nodejs/utils/errors/general')

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)



describe('Players Model', function() {
    let mockPlayerId, mockPlayerIds, idConverterStub, mockEmail,
    mockSub, connectionStub, mockLatitude, mockLongitude, mockConnectionId,
    mockResponse, createStub, updateStub, findOneStub, deleteStub, findStub,
    updateManyStub, updateOneStub, mockLanguage, mockCategory, mockLevel,
    mockDistance, mockId, mockSchema

    this.beforeEach(() => {
        mockPlayerId = "test_player_id"
        mockPlayerIds = ["id2", "id2"]
        idConverterStub = arg => arg,
        mockEmail = "test@email.com"
        mockSub = "afsjfhgjafhsgjsfhsfs"
        mockLatitude = 1234454.222
        mockLongitude = 2232.322
        mockConnectionId = "test_con_id"
        mockResponse = [{connectionId: "test"}]
        mockLanguage = "test_language"
        mockCategory = "test_category"
        mockLevel = 2
        mockDistance = 10
        mockId = "test_id"
        mockSchema = "test_schema"
        updateStub = fake.resolves(mockResponse)
        findOneStub = fake.resolves(mockResponse)
        deleteStub = fake.resolves(mockResponse)
        createStub = fake.resolves(mockResponse)
        findStub = fake.resolves(mockResponse)
        updateManyStub = fake.resolves(mockResponse)
        updateOneStub = fake.resolves(mockResponse)
        aggregateStub = fake.resolves(mockResponse)
        connectionStub = {
            model: fake.returns({
                update: updateStub,
                updateMany: updateManyStub,
                updateOne: updateOneStub,
                findOne: findOneStub,
                find: findStub,
                delete: deleteStub,
                create: createStub,
                aggregate: aggregateStub
            })
        }
    })

    describe("failedToGetPlayersPointsError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetPlayersPointsError().message).to.equal("FAILED_TO_GET_PLAYERS_POINTS")
        })
    })

    describe("invalidSchemaError", function() {
        it("Should create a new error object", () => {
            expect(invalidSchemaError().message).to.equal("INVALID_SCHEMA")
        })
    })

    describe("failedToConvertIdToObjectIdError", function() {
        it("Should create a new error object", () => {
            expect(failedToConvertIdToObjectIdError().message).to.equal("FAILED_TO_CONVERT_ID_TO_OBJECT_ID")
        })
    })

    describe("failedToConvertIdsToObjectIdsError", function() {
        it("Should create a new error object", () => {
            expect(failedToConvertIdsToObjectIdsError().message).to.equal("FAILED_TO_CONVERT_IDS_TO_OBJECT_IDS")
        })
    })

    describe("failedToCreatePlayerError", function() {
        it("Should create a new error object", () => {
            expect(failedToCreatePlayerError().message).to.equal("FAILED_TO_CREATE_PLAYER")
        })
    })

    describe("failedToDeregisterConnectionIdError", function() {
        it("Should create a new error object", () => {
            expect(failedToDeregisterConnectionIdError().message).to.equal("FAILED_TO_DEREGISTER_CONNECTION_ID")
        })
    })

    describe("failedToFindUserByEmailError", function() {
        it("Should create a new error object", () => {
            expect(failedToFindUserByEmailError().message).to.equal("FAILED_TO_FIND_USER_BY_EMAIL")
        })
    })

    describe("failedToFindUserByIdError", function() {
        it("Should create a new error object", () => {
            expect(failedToFindUserByIdError().message).to.equal("FAILED_TO_FIND_USER_BY_ID")
        })
    })

    describe("failedToGetPlayersConIdsError", function() {
        it("Should create a new error object", () => {
            expect(failedToGetPlayersConIdsError().message).to.equal("FAILED_TO_GET_PLAYERS_CONN_IDS")
        })
    })

    describe("failedToFindUserByConIdError", function() {
        it("Should create a new error object", () => {
            expect(failedToFindUserByConIdError().message).to.equal("FAILED_TO_FIND_USER_BY_CONNECTION_ID")
        })
    })

    describe("failedToMarkPlayersAsPlayingError", function() {
        it("Should create a new error object", () => {
            expect(failedToMarkPlayersAsPlayingError().message).to.equal("FAILED_TO_MARK_PLAYERS_AS_PLAYING")
        })
    })

    describe("failedToRegisterConnectionIdError", function() {
        it("Should create a new error object", () => {
            expect(failedToRegisterConnectionIdError().message).to.equal("FAILED_TO_REGISTER_CONNECTION_ID")
        })
    })

    describe("failedToSearchForPlayersError", function() {
        it("Should create a new error object", () => {
            expect(failedToSearchForPlayersError().message).to.equal("FAILED_TO_SEARCH_FOR_PLAYERS")
        })
    })

    describe("failedToUpdatePlayerLocationError", function() {
        it("Should create a new error object", () => {
            expect(failedToUpdatePlayerLocationError().message).to.equal("FAILED_TO_UPDATE_PLAYER_LOCATION")
        })
    })

    describe("convertIdToObjectId", function() {
        it("Should reject if converting id fails", async () => {
            idConverterStub = fake.throws()
            try {
                await convertIdToObjectId(idConverterStub, mockPlayerId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CONVERT_ID_TO_OBJECT_ID")
            }
        })

        it("Should resolve to the passed id", async () => {
            const result = await convertIdToObjectId(idConverterStub, mockPlayerId)
            expect(result).to.equal(mockPlayerId)
        })
    })

    describe("convertIdsToObjectIds", function() {
        it("Should reject if converting id fails", async () => {
            idConverterStub = fake.throws()
            try {
                await convertIdsToObjectIds(idConverterStub, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_CONVERT_IDS_TO_OBJECT_IDS")
            }
        })

        it("Should resolve to the passed ids", async () => {
            const result = await convertIdsToObjectIds(idConverterStub, mockPlayerIds)
            expect(result).to.deep.equal(mockPlayerIds)
        })
    })

    describe("createPlayerSafe", function() {
        it("Should reject if sub is invalid", async () => {
            try {
                await createPlayerSafe(connectionStub, mockSchema, null, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSubError().message)
            }
        })

        it("Should reject if email is invalid", async () => {
            try {
                await createPlayerSafe(connectionStub, mockSchema, mockSub, "")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidEmail().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await createPlayerSafe(connectionStub, mockSchema, mockSub, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await createPlayerSafe(connectionStub, mockSchema, mockSub, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToCreatePlayerError().message)
            }
        })

        it("Should reject if creating player fails", async () => {
            connectionStub = {
                model: fake.returns({create: fake.rejects()})
            }
            try {
                await createPlayerSafe(connectionStub, mockSchema, mockSub, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToCreatePlayerError().message)
            }
        })

        it("Should resolve if model.create succeed", async () => {
            const result = await createPlayerSafe(connectionStub, mockSchema, mockSub, mockEmail)
            expect(result).to.deep.equal(mockResponse)
            expect(createStub.calledOnce).to.be.true
            expect(createStub.getCall(0).args[0]._id).to.equal(mockSub)
            expect(createStub.getCall(0).args[0].email).to.equal(mockEmail)
        })
    })

    describe("findUserByEmailSafe", function() {

        it("Should reject if email is invalid", async () => {
            try {
                await findUserByEmailSafe(connectionStub, mockSchema, "")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidEmail().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await findUserByEmailSafe(connectionStub, mockSchema, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await findUserByEmailSafe(connectionStub, mockSchema, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToFindUserByEmailError().message)
            }
        })

        it("Should reject if finding user by email fails", async () => {
            connectionStub = {
                model: fake.returns({findOne: fake.rejects()})
            }
            try {
                await findUserByEmailSafe(connectionStub, mockSchema, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToFindUserByEmailError().message)
            }
        })

        it("Should resolve if model.findOne succeed", async () => {
            const result = await findUserByEmailSafe(connectionStub, mockSchema, mockEmail)
            expect(result).to.deep.equal(mockResponse)
            expect(findOneStub.calledOnce).to.be.true
            expect(findOneStub.getCall(0).args[0].email).to.equal(mockEmail)
        })
    })


    describe("findUserByConIdSafe", function() {

        it("Should reject if connection id is invalid", async () => {
            try {
                await findUserByConIdSafe(connectionStub, mockSchema, "")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidConnectionIdError().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await findUserByConIdSafe(connectionStub, mockSchema, mockConnectionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await findUserByConIdSafe(connectionStub, mockSchema, mockConnectionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToFindUserByConIdError().message)
            }
        })

        it("Should reject if finding user by connection id fails", async () => {
            connectionStub = {
                model: fake.returns({findOne: fake.rejects()})
            }
            try {
                await findUserByConIdSafe(connectionStub, mockSchema, mockConnectionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToFindUserByConIdError().message)
            }
        })

        it("Should resolve if model.findOne succeed", async () => {
            const result = await findUserByConIdSafe(connectionStub, mockSchema, mockConnectionId)
            expect(result).to.deep.equal(mockResponse)
            expect(findOneStub.calledOnce).to.be.true
            expect(findOneStub.getCall(0).args[0].connectionId).to.equal(mockConnectionId)
        })
    })

    describe("findUserByIdSafe", function() {

        it("Should reject if player id is invalid", async () => {
            try {
                await findUserByIdSafe(connectionStub, idConverterStub, mockSchema, "")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidPidError().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await findUserByIdSafe(connectionStub, idConverterStub, mockSchema, mockPlayerId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await findUserByIdSafe(connectionStub, idConverterStub, mockSchema, mockPlayerId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToFindUserByIdError().message)
            }
        })

        it("Should reject if finding user by id fails", async () => {
            connectionStub = {
                model: fake.returns({findOne: fake.rejects()})
            }
            try {
                await findUserByIdSafe(connectionStub, idConverterStub, mockSchema, mockPlayerId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToFindUserByIdError().message)
            }
        })

        it("Should resolve if model.findOne succeed", async () => {
            const result = await findUserByIdSafe(connectionStub, idConverterStub, mockSchema, mockPlayerId)
            expect(result).to.deep.equal(mockResponse)
            expect(findOneStub.calledOnce).to.be.true
            expect(findOneStub.getCall(0).args[0]._id).to.equal(mockPlayerId)
        })
    })

    describe("getPlayersConIdsSafe", function() {

        it("Should reject if player ids is invalid", async () => {
            try {
                await getPlayersConIdsSafe(connectionStub, idConverterStub, mockSchema, "")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidPlayerIdsError().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await getPlayersConIdsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await getPlayersConIdsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToGetPlayersConIdsError().message)
            }
        })

        it("Should reject if getting players connection ids fails", async () => {
            connectionStub = {
                model: fake.returns({find: fake.rejects()})
            }
            try {
                await getPlayersConIdsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToGetPlayersConIdsError().message)
            }
        })

        it("Should resolve if model.find succeed", async () => {
            const result = await getPlayersConIdsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
            expect(result[0]).to.equal(mockResponse[0].connectionId)
            expect(findStub.calledOnce).to.be.true
            expect(findStub.getCall(0).args[0]._id.$in).to.deep.equal(mockPlayerIds)
        })
    })

    describe("getPlayersPointsSafe", function() {

        it("Should reject if player ids is invalid", async () => {
            try {
                await getPlayersPointsSafe(connectionStub, idConverterStub, mockSchema, "")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidPlayerIdsError().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await getPlayersPointsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await getPlayersPointsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToGetPlayersPointsError().message)
            }
        })

        it("Should reject if getting players points fails", async () => {
            connectionStub = {
                model: fake.returns({find: fake.rejects()})
            }
            try {
                await getPlayersPointsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToGetPlayersPointsError().message)
            }
        })

        it("Should resolve if model.find succeed", async () => {
            mockResponse = [{_id: "test_id", points: 120}]
            findStub = fake.resolves(mockResponse)
            connectionStub = {
                model: fake.returns({find: findStub})
            }
            const result = await getPlayersPointsSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
            expect(result[0]._id).to.equal(mockResponse[0]._id)
            expect(result[0].points).to.equal(mockResponse[0].points)
            expect(findStub.calledOnce).to.be.true
            expect(findStub.getCall(0).args[0]._id.$in).to.deep.equal(mockPlayerIds)
        })
    })

    describe("markPlayersAsPlayingSafe", function() {

        it("Should reject if player ids is invalid", async () => {
            try {
                await markPlayersAsPlayingSafe(connectionStub, idConverterStub, mockSchema, "")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidPlayerIdsError().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await markPlayersAsPlayingSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await markPlayersAsPlayingSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToMarkPlayersAsPlayingError().message)
            }
        })

        it("Should reject if marking players as playing fails", async () => {
            connectionStub = {
                model: fake.returns({updateMany: fake.rejects()})
            }
            try {
                await markPlayersAsPlayingSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToMarkPlayersAsPlayingError().message)
            }
        })

        it("Should resolve if model.updateMany succeed", async () => {
            const result = await markPlayersAsPlayingSafe(connectionStub, idConverterStub, mockSchema, mockPlayerIds)
            expect(result).to.deep.equal(mockResponse)
            expect(updateManyStub.calledOnce).to.be.true
            expect(updateManyStub.getCall(0).args[0]._id.$in).to.deep.equal(mockPlayerIds)
            expect(updateManyStub.getCall(0).args[1].status).to.equal("PLAYING")
        })
    })

    describe("updatePlayersLocationSafe", function() {

        it("Should reject if connection id is invalid", async () => {
            try {
                await updatePlayersLocationSafe(connectionStub, mockSchema, null, mockLatitude, mockLongitude)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidConnectionIdError().message)
            }
        })

        it("Should reject if latitude is invalid", async () => {
            try {
                await updatePlayersLocationSafe(connectionStub, mockSchema, mockConnectionId, null, mockLongitude)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidLatitudeError().message)
            }
        })

        it("Should reject if longitude is invalid", async () => {
            try {
                await updatePlayersLocationSafe(connectionStub, mockSchema, mockConnectionId, mockLatitude, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidLongitudeError().message)
            }
        })

        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await updatePlayersLocationSafe(connectionStub, mockSchema, mockConnectionId, mockLatitude, mockLongitude)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await updatePlayersLocationSafe(connectionStub, mockSchema, mockConnectionId, mockLatitude, mockLongitude)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToUpdatePlayerLocationError().message)
            }
        })

        it("Should reject if updating players location fails", async () => {
            connectionStub = {
                model: fake.returns({updateOne: fake.rejects()})
            }
            try {
                await updatePlayersLocationSafe(connectionStub, mockSchema, mockConnectionId, mockLatitude, mockLongitude)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToUpdatePlayerLocationError().message)
            }
        })

        it("Should resolve if model.updateOne succeed", async () => {
            const result = await updatePlayersLocationSafe(connectionStub, mockSchema, mockConnectionId, mockLatitude, mockLongitude)
            expect(result).to.deep.equal(mockResponse)
            expect(updateOneStub.calledOnce).to.be.true
            expect(updateOneStub.getCall(0).args[0].connectionId).to.equal(mockConnectionId)
            expect(updateOneStub.getCall(0).args[0].status).to.equal("ready")
            expect(updateOneStub.getCall(0).args[0].online).to.be.true
            expect(updateOneStub.getCall(0).args[1].location.type).to.equal("Point")
            expect(updateOneStub.getCall(0).args[1].location.coordinates[0]).to.equal(mockLongitude)
            expect(updateOneStub.getCall(0).args[1].location.coordinates[1]).to.equal(mockLatitude)
        })
    })

    describe("registerConnectionIdSafe", function() {

        it("Should reject if connection id is invalid", async () => {
            try {
                await registerConnectionIdSafe(connectionStub, mockSchema, null, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidConnectionIdError().message)
            }
        })

        it("Should reject if email is invalid", async () => {
            try {
                await registerConnectionIdSafe(connectionStub, mockSchema, mockConnectionId, null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidEmail().message)
            }
        })


        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await registerConnectionIdSafe(connectionStub, mockSchema, mockConnectionId, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await registerConnectionIdSafe(connectionStub, mockSchema, mockConnectionId, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToRegisterConnectionIdError().message)
            }
        })

        it("Should reject if registering connection id fails", async () => {
            connectionStub = {
                model: fake.returns({updateOne: fake.rejects()})
            }
            try {
                await registerConnectionIdSafe(connectionStub, mockSchema, mockConnectionId, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToRegisterConnectionIdError().message)
            }
        })

        it("Should resolve if model.updateOne succeed", async () => {
            const result = await registerConnectionIdSafe(connectionStub, mockSchema, mockConnectionId, mockEmail)
            expect(result).to.deep.equal(mockResponse)
            expect(updateOneStub.calledOnce).to.be.true
            expect(updateOneStub.getCall(0).args[0].email).to.equal(mockEmail)
            expect(updateOneStub.getCall(0).args[1].connectionId).to.equal(mockConnectionId)
            expect(updateOneStub.getCall(0).args[1].status).to.equal("ready")
            expect(updateOneStub.getCall(0).args[1].online).to.be.true
        })
    })

    describe("deregisterConnectionIdSafe", function() {

        it("Should reject if connection id is invalid", async () => {
            try {
                await deregisterConnectionIdSafe(connectionStub, mockSchema, null, mockEmail)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidConnectionIdError().message)
            }
        })


        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await deregisterConnectionIdSafe(connectionStub, mockSchema, mockConnectionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await deregisterConnectionIdSafe(connectionStub, mockSchema, mockConnectionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToDeregisterConnectionIdError().message)
            }
        })

        it("Should reject if deregistering connection id fails", async () => {
            connectionStub = {
                model: fake.returns({updateOne: fake.rejects()})
            }
            try {
                await deregisterConnectionIdSafe(connectionStub, mockSchema, mockConnectionId)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToDeregisterConnectionIdError().message)
            }
        })

        it("Should resolve if model.updateOne succeed", async () => {
            const result = await deregisterConnectionIdSafe(connectionStub, mockSchema, mockConnectionId)
            expect(result).to.deep.equal(mockResponse)
            expect(updateOneStub.calledOnce).to.be.true
            expect(updateOneStub.getCall(0).args[0].connectionId).to.equal(mockConnectionId)
            expect(updateOneStub.getCall(0).args[1].connectionId).to.equal("")
            expect(updateOneStub.getCall(0).args[1].status).to.equal("inactive")
            expect(updateOneStub.getCall(0).args[1].online).to.be.false
        })
    })

    describe("searchForPlayersSafe", function() {

        it("Should reject if id is invalid", async () => {
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    null,
                    mockLatitude,
                    mockLongitude,
                    mockLanguage,
                    mockCategory,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidPidError().message)
            }
        })

        it("Should reject if latitude is invalid", async () => {
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    null,
                    mockLongitude,
                    mockLanguage,
                    mockCategory,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidLatitudeError().message)
            }
        })

        it("Should reject if longitude is invalid", async () => {
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    null,
                    mockLanguage,
                    mockCategory,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidLongitudeError().message)
            }
        })

        it("Should reject if language is invalid", async () => {
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    mockLongitude,
                    null,
                    mockCategory,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidLanguageError().message)
            }
        })

        it("Should reject if category is invalid", async () => {
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    mockLongitude,
                    mockLanguage,
                    null,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidCategoryError().message)
            }
        })

        it("Should reject if level is invalid", async () => {
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    mockLongitude,
                    mockLanguage,
                    mockCategory,
                    null,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidLevelError().message)
            }
        })

        it("Should reject if maxDistance is invalid", async () => {
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    mockLongitude,
                    mockLanguage,
                    mockCategory,
                    mockLevel,
                    null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidNumberError().message)
            }
        })


        it("Should reject if schema is invalid", async () => {
            mockSchema = null
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    mockLongitude,
                    mockLanguage,
                    mockCategory,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(invalidSchemaError().message)
            }
        })

        it("Should reject if calling model throws error", async () => {
            connectionStub = {
                model: fake.throws()
            }
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    mockLongitude,
                    mockLanguage,
                    mockCategory,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToSearchForPlayersError().message)
            }
        })

        it("Should reject if searching for players fails", async () => {
            connectionStub = {
                model: fake.returns({aggregate: fake.rejects()})
            }
            try {
                await searchForPlayersSafe(
                    connectionStub,
                    idConverterStub,
                    mockSchema, 
                    mockId,
                    mockLatitude,
                    mockLongitude,
                    mockLanguage,
                    mockCategory,
                    mockLevel,
                    mockDistance)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal(failedToSearchForPlayersError().message)
            }
        })

        it("Should resolve model.aggregate succeed", async () => {
            const result = await searchForPlayersSafe(
                connectionStub,
                idConverterStub,
                mockSchema, 
                mockId,
                mockLatitude,
                mockLongitude,
                mockLanguage,
                mockCategory,
                mockLevel,
                mockDistance)
            expect(result).to.deep.equal(mockResponse)
            const args = aggregateStub.getCall(0).args[0][0].$geoNear
            expect(aggregateStub.calledOnce).to.be.true
            expect(args.near.type).to.equal("Point")
            expect(args.near.coordinates).to.deep.equal([mockLongitude, mockLatitude])
            expect(args.distanceField).to.equal("distance")
            expect(args.query.online).to.be.true
            expect(args.query.status).to.equal("READY")
            expect(args.query.category).to.equal(mockCategory)
            expect(args.query.level).to.equal(mockLevel)
            expect(args.query.language).to.equal(mockLanguage)
            expect(args.maxDistance).to.equal(mockDistance)
            expect(args.query._id.$ne).to.equal(mockId)
            expect(args.spherical).to.be.true
        })
    })
})


