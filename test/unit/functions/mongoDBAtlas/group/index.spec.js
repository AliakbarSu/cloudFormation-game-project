

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/group/index')
const GROUP = require('../../../../../src/mongoDBAtlas/group/group')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("Group::index", function() {
    let createGroupStub, deleteGroupStub,
    sendResponseStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const group = {
        id: "test_group"
    }

    this.beforeAll(() => {
       createGroupStub = sinon.stub(GROUP, "createGroup").resolves(group)
       deleteGroupStub = sinon.stub(GROUP, "deleteGroup").resolves(group)
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createGroupStub.resetHistory()
        deleteGroupStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createGroupStub.restore()
        deleteGroupStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createGroup when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createGroupStub.calledOnce).to.be.true
        expect(createGroupStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call deletGroup when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteGroupStub.calledOnce).to.be.true
        expect(deleteGroupStub.getCall(0).args[0]).to.deep.equal(event)
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
        createGroupStub.rejects()
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
        createGroupStub.returns(new Promise((resolve) => setTimeout(() => resolve(group), 100)))

        await handler(event, context)
        
        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})