

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/trigger/index')
const TRIGGER = require('../../../../../src/mongoDBAtlas/trigger/trigger')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("Trigger::index", function() {
    let createEventTriggerStub, updateEventTriggerStub, deleteEventTriggerStub,
    sendResponseStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const trigger = {
        _id: "test_event_trigger_id"
    }

    this.beforeAll(() => {
       createEventTriggerStub = sinon.stub(TRIGGER, "createEventTrigger").resolves(trigger)
       updateEventTriggerStub = sinon.stub(TRIGGER, "updateEventTrigger").resolves(trigger)
       deleteEventTriggerStub = sinon.stub(TRIGGER, "deleteEventTrigger").resolves(trigger)
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createEventTriggerStub.resetHistory()
        updateEventTriggerStub.resetHistory()
        deleteEventTriggerStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createEventTriggerStub.restore()
        updateEventTriggerStub.restore()
        deleteEventTriggerStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createEventTrigger when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createEventTriggerStub.calledOnce).to.be.true
        expect(createEventTriggerStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call updateEventTrigger when RequestType is 'Update' and pass the event and context object", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(updateEventTriggerStub.calledOnce).to.be.true
        expect(updateEventTriggerStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call deletEventTrigger when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteEventTriggerStub.calledOnce).to.be.true
        expect(deleteEventTriggerStub.getCall(0).args[0]).to.deep.equal(event)
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
        createEventTriggerStub.rejects()
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
        createEventTriggerStub.returns(new Promise((resolve) => setTimeout(() => resolve(trigger), 100)))

        await handler(event, context)
        
        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})