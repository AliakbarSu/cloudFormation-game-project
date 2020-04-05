const { timeout } = require('../../../src/opt/nodejs/utils/timeout')
const SR = require('../../../src/opt/nodejs/utils/sendResponse')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

describe("Layer::utils::timeout", function() {
    let sendResponseStub;

    let event = {
        property: "test_value"
    }
    let context = {property: "test_value"}

    this.beforeAll(() => {
        sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        sendResponseStub.restore()
    })

    it("Should call sendResponse after specified amout of milliseconds", async () => {
        await timeout(event, context, 100)
        expect(sendResponseStub.calledOnce).to.be.true
    })

    it("Should pass event and context to sendResponse with FAILED status", async () => {
        // sendResponseStub.rejects()
        await timeout(event, context, 100)
        expect(sendResponseStub.calledOnce).to.be.true
        expect(sendResponseStub.getCall(0).args[0]).to.deep.equal(event)
        expect(sendResponseStub.getCall(0).args[1]).to.deep.equal(context)
        expect(sendResponseStub.getCall(0).args[2]).to.equal("FAILED")
    })
})