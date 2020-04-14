const { 
    invalidFiltersDataError,
    failedToGenerateQuizeError,
    validateFilters,
    generateQuizeSafe,
    applyFiltersLimit
 } = require('../../../src/opt/nodejs/models/questions.model')

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe("QuestionsModel", function() {

    let filters, result, mockConnector, mockRequestId, IdGenerator

    this.beforeEach(() => {
        filters = {
            subject: "test_subject",
            language: "test_language",
            level: 2,
            limit: 1
        }

        result = {Count: 2, Items: ["first", "second"]}

        mockRequestId = "test_id"
        IdGenerator = fake.returns(mockRequestId)
        mockConnector = {
            scan: fake.returns({promise: fake.resolves(result)})
        }
    })

    describe("invalidFiltersDataError", function() {
        it("Should create a new error object", () => {
            expect(invalidFiltersDataError().message).to.equal("INVALID_FILTERS_PROVIDED")
        })
    })

    describe("failedToGenerateQuizeError", function() {
        it("Should create a new error object", () => {
            expect(failedToGenerateQuizeError().message).to.equal("FAILED_TO_GENERATE_QUIZE")
        })
    })

    describe("validateFilters", function() {
        it("Should return false if filters language property is invalid", () => {
            filters.language = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return false if filters level property is invalid", () => {
            filters.level = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return false if filters subject property is invalid", () => {
            filters.subject = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return false if filters level property is invalid", () => {
            filters.limit = ""
            expect(validateFilters(filters)).to.be.false
        })

        it("Should return true if all players properties are valid", () => {
            expect(validateFilters(filters)).to.be.true
        })
    })

    describe("applyFiltersLimit", function() {
        it("Should slice an array according to the limit value", () => {
            expect(applyFiltersLimit(result.Items, 1).length).to.equal(1)
            expect(applyFiltersLimit(result.Items, 1)).to.deep.equal([result.Items[0]])
        })
    })


    describe("generateQuizeSafe", function() {
        let mockTablename

        this.beforeEach(() => {
            mockTablename = "test_table"
        })

        it("Should reject if table name is invalid", (done) => {
            mockTablename = ""
            expect(generateQuizeSafe(mockConnector, IdGenerator, mockTablename, filters))
            .to.be.rejected.notify(done)
        })

        it("Should reject if filters object is invalid", (done) => {
            filters.language = ""
            expect(generateQuizeSafe(mockConnector, IdGenerator, mockTablename, filters))
            .to.be.rejected.notify(done)
        })

        it("Should pass correct data to connector.scan function", async () => {
            await generateQuizeSafe(mockConnector, IdGenerator, mockTablename, filters)
            expect(mockConnector.scan.calledOnce).to.be.true
            expect(mockConnector.scan.getCall(0).args[0].TableName).to.equal(mockTablename)
            expect(mockConnector.scan.getCall(0).args[0].ExpressionAttributeValues[":category"])
            .to.equal(filters.subject)
            expect(mockConnector.scan.getCall(0).args[0].ExpressionAttributeValues[":level"])
            .to.equal("Grade " + filters.level)
            expect(mockConnector.scan.getCall(0).args[0].ExpressionAttributeValues[":language"])
            .to.equal(filters.language)
        })

        it("Should return an array containing only one item", (done) => {
            filters.limit = 1
            expect(generateQuizeSafe(mockConnector, IdGenerator, mockTablename, filters))
            .to.become([result.Items[0]]).notify(done)
        })

        it("Should reject if connector.scan fails", (done) => {
            mockConnector.scan = fake.returns({promise: fake.rejects()})
            expect(generateQuizeSafe(mockConnector, IdGenerator, mockTablename, filters))
            .to.be.rejected.notify(done)
        })
    })
})