const { 
    failedToUpdatePlayersLocationError,
    handlerSafe
 } = require('../../../../src/updateLocation/index')

const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)



describe("updateLocation::index", function() {
    let mockConnectionId, mockLatitude, mockLongitude,
    mockEvent, mockContext, updatePlayersLocationStub

    this.beforeEach(() => {
        mockConnectionId = "test_connectionId"
        mockLatitude = 12323.233
        mockLongitude = 22444.244
        mockContext = {
            callbackWaitsForEmptyEventLoop: true
        }
        mockEvent = {
            connectionId: mockConnectionId,
            data: {
                longitude: mockLongitude,
                mockLatitude: mockLatitude
            }
        }
        updatePlayersLocationStub = fake.resolves()
    })

    describe("failedToUpdatePlayersLocationError", function() {
        it("Should return an error object", () => {
            expect(failedToUpdatePlayersLocationError().message)
            .to.equal("FAILED_TO_UPDATE_PLAYERS_LOCATION")
        })
    })

    describe("handlerSafe", function() {
        it("Should reject if connection id is invalid", async () => {
            mockEvent.connectionId = null
            try {
                await handlerSafe(updatePlayersLocationStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_CONNECTION_ID_PROVIDED")
            }
        })

        it("Should reject if latitude is invalid", async () => {
            mockEvent.data.latitude = -1
            try {
                await handlerSafe(updatePlayersLocationStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_LATITUDE_PROVIDED")
            }
        })

        it("Should reject if longitude is invalid", async () => {
            mockEvent.data.longitude = -1
            try {
                await handlerSafe(updatePlayersLocationStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("INVALID_LONGITUDE_PROVIDED")
            }
        })

        it("Should reject if updatePlayersLocation fails", async () => {
            updatePlayersLocationStub = fake.rejects()
            try {
                await handlerSafe(updatePlayersLocationStub, mockEvent, mockContext)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_UPDATE_PLAYERS_LOCATION")
            }
        })

        it("Should set callbackWaitsForEmptyEventLoop to false", async () => {
            await handlerSafe(updatePlayersLocationStub, mockEvent, mockContext)
            expect(mockContext.callbackWaitsForEmptyEventLoop).to.be.false
        })

        it("Should resolve if everything went well", async () => {
            const result = await handlerSafe(updatePlayersLocationStub, mockEvent, mockContext)
            expect(result).to.equal("LOCATION_UPDATED_SECCESSFULLY")
        })

        
    })
})