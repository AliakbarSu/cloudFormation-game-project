

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/stitch/index')
const STITCH = require('../../../../../src/mongoDBAtlas/stitch/stitch')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("Stitch::index", function() {
    let createStitchAppStub, updateStitchAppStub, deleteStitchAppStub,
    sendResponseStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const stitch = {
        id: "test_stitch_app_id"
    }

    this.beforeAll(() => {
       createStitchAppStub = sinon.stub(STITCH, "createStitchApp").resolves(stitch)
       updateStitchAppStub = sinon.stub(STITCH, "updateStitchApp").resolves(stitch)
       deleteStitchAppStub = sinon.stub(STITCH, "deleteStitchApp").resolves(stitch)
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createStitchAppStub.resetHistory()
        updateStitchAppStub.resetHistory()
        deleteStitchAppStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createStitchAppStub.restore()
        updateStitchAppStub.restore()
        deleteStitchAppStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createStitchApp when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createStitchAppStub.calledOnce).to.be.true
        expect(createStitchAppStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call updateStitchApp when RequestType is 'Update' and pass the event and context object", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(updateStitchAppStub.calledOnce).to.be.true
        expect(updateStitchAppStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call deletStitchApp when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteStitchAppStub.calledOnce).to.be.true
        expect(deleteStitchAppStub.getCall(0).args[0]).to.deep.equal(event)
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
        createStitchAppStub.rejects()
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
        createStitchAppStub.returns(new Promise((resolve) => setTimeout(() => resolve(stitch), 100)))

        await handler(event, context)
        
        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})