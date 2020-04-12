

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/service/index')
const SERVICE = require('../../../../../src/mongoDBAtlas/service/service')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("Service::index", function() {
    let createServiceStub, updateServiceStub, deleteServiceStub,
    sendResponseStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const stitch = {
        id: "test_stitch_app_id"
    }

    this.beforeAll(() => {
       createServiceStub = sinon.stub(SERVICE, "createService").resolves(stitch)
       updateServiceStub = sinon.stub(SERVICE, "updateService").resolves(stitch)
       deleteServiceStub = sinon.stub(SERVICE, "deleteService").resolves(stitch)
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createServiceStub.resetHistory()
        updateServiceStub.resetHistory()
        deleteServiceStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createServiceStub.restore()
        updateServiceStub.restore()
        deleteServiceStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createService when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createServiceStub.calledOnce).to.be.true
        expect(createServiceStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call updateService when RequestType is 'Update' and pass the event and context object", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(updateServiceStub.calledOnce).to.be.true
        expect(updateServiceStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call deletService when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteServiceStub.calledOnce).to.be.true
        expect(deleteServiceStub.getCall(0).args[0]).to.deep.equal(event)
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
        createServiceStub.rejects()
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
        context.getRemainingTimeInMillis = () => 50
        createServiceStub.returns(new Promise((resolve) => setTimeout(() => resolve(stitch), 100)))

        await handler(event, context)
        
        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})