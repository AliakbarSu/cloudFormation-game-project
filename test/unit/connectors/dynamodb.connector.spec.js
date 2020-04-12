

// const DBC = require('../../../src/opt/nodejs/dynamodb.connector')
// const AWS = require('aws-sdk')
// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")


// xdescribe("Dynamodb Connector", function() {
//     let deps, dynamodbConnectorObj;
//     let documentClientStub;
//     let mockDocumentClient = {}


//     this.beforeAll(() => {
//         dynamodbConnectorObj = new DBC.DynamoDbConnector()
//     })

//     this.afterEach(() => {
//         documentClientStub.resetHistory()
//     })

//     this.afterAll(() => {
//         documentClientStub.restore()
//     })

//     describe("Module Initialization", function() {
//         this.beforeAll(() => {
//             documentClientStub = sinon.stub(AWS.DynamoDB, "DocumentClient").callsFake(() => mockDocumentClient)
//         })
//         it("Should call aws.Dynamodb.DocumentClient constructor", () => {
//             dynamodbConnectorObj = new DBC.DynamoDbConnector()
//             expect(documentClientStub.calledOnce).to.be.true
//         })
//         it("Should assing _connector to the DocumentClient value", () => {
//             expect(dynamodbConnectorObj._connector).to.deep.equal(mockDocumentClient)
//         })
       
//     })

//     describe("get connector", function() {
//         it("Should return _connector property", () => {
//             const testConnector = "TEST_CONNECTOR"
//             dynamodbConnectorObj._connector = testConnector
//             expect(dynamodbConnectorObj.connector()).to.equal(testConnector)
//         })
//     })
// })
