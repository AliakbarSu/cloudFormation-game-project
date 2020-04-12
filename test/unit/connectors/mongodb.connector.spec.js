// let layerPath = "../../../src/opt/nodejs/";
// if(!process.env['DEV']) {
//     layerPath = "/opt/nodejs/"
// }

// const mongodbConnector = require(layerPath + 'mongodb.connector')
// const CONSTANTS = require(layerPath + 'constants')
// const mongoose = require('mongoose')
// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")

// xdescribe("MongoDB Connector", function() {

//     let deps, mongodbConnectionObj;
//     let createConnectionStub;
//     const testConnection = "TEST_CONNECTION"

//     deps = {
//         CONSTANTS,
//         mongoose
//     }

//     this.beforeAll(() => {
//         createConnectionStub = sinon.stub(mongoose, "createConnection").resolves(testConnection)
//         mongodbConnectionObj = new mongodbConnector.MongoDbConnector(deps)
//     })

//     describe("initialize", function() {
//         it("Should create one instance of mongoose connection",  async () => {
//             await mongodbConnectionObj.initialize()
//             await mongodbConnectionObj.initialize()
//             expect(createConnectionStub.callCount).to.equal(1)
//         })

//         it("Should pass the correct connection string to createConnection", async () => {
//             const connectionString = "TEST_STRING"
//             CONSTANTS.MONGO_DB_URI = connectionString
//             mongodbConnector.MongoDbConnector._connector = null;
//             mongodbConnectionObj = new mongodbConnector.MongoDbConnector(deps)
//             await mongodbConnectionObj.initialize()
//             expect(createConnectionStub.getCall(1).args[0]).to.equal(connectionString)

//         })
//     })

//     describe("connection", function() {
//         it("Should return _connector property", async () => {
//             await mongodbConnectionObj.initialize()
//             expect(await mongodbConnectionObj.connection()).to.equal(testConnection)
//         })
//     })
// })