

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/collection/index')
const COLLECTION = require('../../../../../src/mongoDBAtlas/collection/collection')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("Collection::index", function() {
    let createCollectionStub, updateCollectionStub, deleteCollectionStub,
    sendResponseStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const collection = {
        collectionName: "test_collection"
    }

    this.beforeAll(() => {
       createCollectionStub = sinon.stub(COLLECTION, "createCollection").resolves(collection)
       updateCollectionStub = sinon.stub(COLLECTION, "updateCollection").resolves(collection)
       deleteCollectionStub = sinon.stub(COLLECTION, "deleteCollection").resolves(collection)
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createCollectionStub.resetHistory()
        updateCollectionStub.resetHistory()
        deleteCollectionStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createCollectionStub.restore()
        updateCollectionStub.restore()
        deleteCollectionStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createCollection when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createCollectionStub.calledOnce).to.be.true
        expect(createCollectionStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call updateCollection when RequestType is 'Update' and pass the event and context object", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(updateCollectionStub.calledOnce).to.be.true
        expect(updateCollectionStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call deletCollection when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteCollectionStub.calledOnce).to.be.true
        expect(deleteCollectionStub.getCall(0).args[0]).to.deep.equal(event)
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
        createCollectionStub.rejects()
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
        createCollectionStub.returns(new Promise((resolve) => setTimeout(() => resolve(collection), 100)))

        await handler(event, context)

        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})