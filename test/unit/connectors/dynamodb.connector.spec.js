let layerPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}

const dynamodbConnector = require(layerPath + 'dynamodb.connector')
const CONSTANTS = require(layerPath + 'constants')
const AWS = require('aws-sdk')
const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")


describe("Dynamodb Connector", function() {
    let deps, dynamodbConnectorObj;
    let documentClientStub;
    let mockDocumentClient = {}

    deps = {
        CONSTANTS,
        AWS
    }

    this.beforeAll(() => {
        dynamodbConnectorObj = new dynamodbConnector(deps)
    })

    this.afterEach(() => {
        documentClientStub.resetHistory()
    })

    this.afterAll(() => {
        documentClientStub.restore()
    })

    describe("Module Initialization", function() {
        this.beforeAll(() => {
            documentClientStub = sinon.stub(AWS.DynamoDB, "DocumentClient").callsFake(() => mockDocumentClient)
        })
        it("Should call aws.Dynamodb.DocumentClient constructor", () => {
            dynamodbConnectorObj = new dynamodbConnector(deps)
            expect(documentClientStub.calledOnce).to.be.true
        })
        it("Should assing _connector to the DocumentClient value", () => {
            expect(dynamodbConnectorObj._connector).to.deep.equal(mockDocumentClient)
        })
        it("Should set region to 'us-east-1' if no region is provided", () => {
            dynamodbConnectorObj = new dynamodbConnector(deps)
            expect(documentClientStub.getCall(0).args[0].region).to.equal('us-east-1')
        })

        it("Should set DocumentClient region to provided region", () => {
            const testRegion = "TEST_REGION"
            dynamodbConnectorObj = new dynamodbConnector({...deps, region: testRegion})
            expect(documentClientStub.getCall(0).args[0].region).to.equal(testRegion)
        })
    })

    describe("get connector", function() {
        it("Should return _connector property", () => {
            const testConnector = "TEST_CONNECTOR"
            dynamodbConnectorObj._connector = testConnector
            expect(dynamodbConnectorObj.connector()).to.equal(testConnector)
        })
    })
})
