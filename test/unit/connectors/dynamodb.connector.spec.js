const { dynamodbConnector } = require('../../../src/opt/nodejs/connectors/dynamodb.connector')
const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")
const fake = sinon.fake


describe("Dynamodb Connector", function() {
    let connectorStub, mockConnector

    this.beforeEach(() => {
        mockConnector = "test_connector"
        connectorStub = fake.returns(mockConnector)
    })
    describe("dynamodbConnector", function() {
        it("Should return the connector instance", () => {
            expect(dynamodbConnector(mockConnector)).to.equal(mockConnector)
        })
    })
})
