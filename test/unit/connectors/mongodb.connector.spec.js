const {
    invalidBufferCommandError,
    invalidBufferMaxEntriesError,
    invalidMongoDbURIConStringError,
    validateBufferCommands,
    validateBufferMaxEntries,
    validateConnectionString,
    createConnection,
    createConnectionObject,
    getConnectionSafe
} = require("../../../src/opt/nodejs/mongodb.connector")

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe("MongoDB Connector", function() {
    let mockCurrentConnection, mockCreateConnection,
    mockBufferCommands, mockBufferMaxEntries,
    mockURI, mockConnection

    this.beforeEach(() => {
        mockConnection = "test_connection"
        mockCurrentConnection = "test_currentConnection"
        mockURI = "test_uri",
        mockBufferCommands = true,
        mockBufferMaxEntries = 2
        mockCreateConnection = fake.resolves(mockConnection)
    })

    describe("invalidBufferCommandError", function() {
        it("Should create a new error object", () => {
            expect(invalidBufferCommandError().message).to.equal("INVALID_BUFFER_COMMAND")
        })
    })

    describe("invalidBufferMaxEntriesError", function() {
        it("Should create a new error object", () => {
            expect(invalidBufferMaxEntriesError().message).to.equal("INVALID_BUFFER_MAX_ENTRIES")
        })
    })

    describe("invalidMongoDbURIConStringError", function() {
        it("Should create a new error object", () => {
            expect(invalidMongoDbURIConStringError().message).to.equal("INVALID_MONGO_DB_CONNECTION_STRING")
        })
    })

    describe("validateBufferCommands", function() {
        it("Should return false if value is not boolean", () => {
            mockBufferCommands = "2"
            expect(validateBufferCommands(mockBufferCommands)).to.be.false
        })
        it("Should return false if value is empty", () => {
            mockBufferCommands = ""
            expect(validateBufferCommands(mockBufferCommands)).to.be.false
        })
        it("Should return true if value is a boolean", () => {
            mockBufferCommands = true
            expect(validateBufferCommands(mockBufferCommands)).to.be.true
        })
    })

    describe("validateBufferMaxEntries", function() {
        it("Should return false if value is not a number", () => {
            mockBufferMaxEntries = "two"
            expect(validateBufferMaxEntries(mockBufferMaxEntries)).to.be.false
        })
        it("Should return false if value is empty", () => {
            mockBufferMaxEntries = ""
            expect(validateBufferMaxEntries(mockBufferMaxEntries)).to.be.false
        })
        it("Should return true if value is an integer", () => {
            mockBufferMaxEntries = 2
            expect(validateBufferMaxEntries(mockBufferMaxEntries)).to.be.true
        })
    })

    describe("validateConnectionString", function() {
        it("Should return false if value is null", () => {
            mockURI = null
            expect(validateConnectionString(mockURI)).to.be.false
        })
        it("Should return false if value is empty string", () => {
            mockURI = ""
            expect(validateConnectionString(mockURI)).to.be.false
        })
        it("Should return true if value is a valid uri string", () => {
            mockURI = "test_uri"
            expect(validateConnectionString(mockURI)).to.be.true
        })
    })

    describe("createConnectionObject", function() {
        let mockConnectionObject

        this.beforeEach(() => {
            mockConnectionObject = {
                bufferCommands: mockBufferCommands,
                bufferMaxEntries: mockBufferMaxEntries
            }
        })

        it("Should return an object containing the config params", () => {
            expect(createConnectionObject(
                mockBufferCommands, 
                mockBufferMaxEntries).bufferCommands)
            .to.equal(mockBufferCommands)
            expect(createConnectionObject(
                mockBufferCommands, 
                mockBufferMaxEntries).bufferMaxEntries)
            .to.equal(mockBufferMaxEntries)
        })

        it("Should return a connection string", (done) => {
            expect(createConnection(
                mockCreateConnection, 
                mockURI, 
                mockConnectionObject)).to.become(mockConnection).notify(done)
            expect(mockCreateConnection.calledOnce).to.be.true
        })

        it("Should return reject when createConnection fails", (done) => {
            mockCreateConnection = fake.rejects()
            expect(createConnection(
                mockCreateConnection, 
                mockURI, 
                mockConnectionObject)).to.be.rejected.notify(done)
        })
    })

    describe("getConnectionSafe", function() {
        it("Should reject if connection string is invalid", (done) => {
            expect(getConnectionSafe(
                mockCurrentConnection, 
                mockCreateConnection, 
                mockBufferCommands, 
                mockBufferMaxEntries, 
                "")).to.be.rejected.notify(done)
        })
        it("Should reject if bufferCommands is invalid", (done) => {
            expect(getConnectionSafe(
                mockCurrentConnection, 
                mockCreateConnection, 
                "", 
                mockBufferMaxEntries, 
                mockURI)).to.be.rejected.notify(done)
        })
        it("Should reject if bufferMaxEntries is invalid", (done) => {
            expect(getConnectionSafe(
                mockCurrentConnection, 
                mockCreateConnection, 
                mockBufferCommands, 
                "", 
                mockURI)).to.be.rejected.notify(done)
        })

        it("Should resolve to a new connection if currentConnection is null", (done) => {
            mockCurrentConnection = null
            getConnectionSafe(
                mockCurrentConnection, 
                mockCreateConnection, 
                mockBufferCommands, 
                mockBufferMaxEntries, 
                mockURI).then(data => {
                    expect(data).to.equal(mockConnection)
                    expect(mockCreateConnection.calledOnce).to.be.true
                    expect(mockCreateConnection.getCall(0).args[0]).to.be.equal(mockURI)
                    expect(mockCreateConnection.getCall(0).args[1].bufferCommands)
                    .to.equal(mockBufferCommands)
                    done()
                })
        })

        it("Should resolve to currentConnection if currentConnection is not null", (done) => {
            getConnectionSafe(
                mockCurrentConnection, 
                mockCreateConnection, 
                mockBufferCommands, 
                mockBufferMaxEntries, 
                mockURI).then(data => {
                    expect(data).to.equal(mockCurrentConnection)
                    expect(mockCreateConnection.calledOnce).to.be.false
                    done()
                })
                
        })
    })
})      

