

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/databaseUser/index')
const USER = require('../../../../../src/mongoDBAtlas/databaseUser/databaseUser')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("DatabaseUser::index", function() {
    let createDatabaseUserStub, updateDatabaseUserStub, deleteDatabaseUserStub,
    sendResponseStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const user = {
        id: "test_user"
    }

    this.beforeAll(() => {
       createDatabaseUserStub = sinon.stub(USER, "createDatabaseUser").resolves(user)
       updateDatabaseUserStub = sinon.stub(USER, "updateDatabaseUser").resolves(user)
       deleteDatabaseUserStub = sinon.stub(USER, "deleteDatabaseUser").resolves(user)
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createDatabaseUserStub.resetHistory()
        updateDatabaseUserStub.resetHistory()
        deleteDatabaseUserStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createDatabaseUserStub.restore()
        updateDatabaseUserStub.restore()
        deleteDatabaseUserStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createDatabaseUser when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createDatabaseUserStub.calledOnce).to.be.true
        expect(createDatabaseUserStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call updateDatabaseUser when RequestType is 'Update' and pass the event and context object", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(updateDatabaseUserStub.calledOnce).to.be.true
        expect(updateDatabaseUserStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should call deletDatabaseUser when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteDatabaseUserStub.calledOnce).to.be.true
        expect(deleteDatabaseUserStub.getCall(0).args[0]).to.deep.equal(event)
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
        createDatabaseUserStub.rejects()
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
        createDatabaseUserStub.returns(new Promise((resolve) => setTimeout(() => resolve(user), 100)))

        await handler(event, context)
        
        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})