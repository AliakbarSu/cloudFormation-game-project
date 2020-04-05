

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/ipWhitelist/index')
const IP = require('../../../../../src/mongoDBAtlas/ipWhitelist/ipWhitelist')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("IpWhitelist::index", function() {
    let createIpStub, updateIpStub, deleteIpStub,
    sendResponseStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const ip = {
        ipAddress: "test_group"
    }

    this.beforeAll(() => {
       createIpStub = sinon.stub(IP, "createIp").resolves(ip)
       updateIpStub = sinon.stub(IP, "updateIp").resolves(ip)
       deleteIpStub = sinon.stub(IP, "deleteIp").resolves(ip)
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createIpStub.resetHistory()
        updateIpStub.resetHistory()
        deleteIpStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createIpStub.restore()
        updateIpStub.restore()
        deleteIpStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createIp when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createIpStub.calledOnce).to.be.true
        expect(createIpStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call updateIp when RequestType is 'Update' and pass the event and context object", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(updateIpStub.calledOnce).to.be.true
        expect(updateIpStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call deletIp when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteIpStub.calledOnce).to.be.true
        expect(deleteIpStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should invoke sendResponse with FAILED status when unkown RequestType is passed", async () => {
        event.RequestType = "Unkown"
        let result;
        try {
            result = await handler(event, context)
        }finally {
            expect(sendResponseStub.calledOnce).to.be.true
            expect(sendResponseStub.getCall(0).args[2]).to.equal("FAILED")
        }
    })

    it("Should invoke sendResponse with FAILED status when exception is thrown", async () => {
        event.RequestType = "Create"
        createIpStub.rejects()
        try {
            result = await handler(event, context)
        }finally {
            expect(sendResponseStub.calledOnce).to.be.true
            expect(sendResponseStub.getCall(0).args[2]).to.equal("FAILED")
        }
    })

    it("Should invoke sendResponse with FAILED status when function is about to timeout", async () => {
        event.RequestType = "Create"
        event.testProp = "true"
        context.get_remaining_time_in_millis = () => 50
        createIpStub.returns(new Promise((resolve) => setTimeout(() => resolve(ip), 100)))

        await handler(event, context)
        
        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})