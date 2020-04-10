

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')

const { handler } = require('../../../../../src/mongoDBAtlas/cluster/index')
const CLUSTER_STATE = require('../../../../../src/mongoDBAtlas/cluster/clusterState')
const CLUSTER = require('../../../../../src/mongoDBAtlas/cluster/cluster')
const SR = require('../../../../../src/opt/nodejs/utils/sendResponse')


describe("Cluster::index", function() {
    let createClusterStub, updateClusterStub, deleteClusterStub, 
    fetchClusterStub, checkClusterStatusStub, sendResponseStub,
    checkClusterDeleteStatusStub;

    let context = {getRemainingTimeInMillis: () => 100}
    let event = {
        RequestType: "Create"
    }

    const cluster = {
        name: "test_cluster",
        stateName: "idle"
    }

    this.beforeAll(() => {
       createClusterStub = sinon.stub(CLUSTER, "createCluster").resolves(cluster)
       updateClusterStub = sinon.stub(CLUSTER, "updateCluster").resolves(cluster)
       deleteClusterStub = sinon.stub(CLUSTER, "deleteCluster").resolves(cluster)
       fetchClusterStub = sinon.stub(CLUSTER, "fetchCluster").resolves(cluster)
       checkClusterStatusStub = sinon.stub(CLUSTER_STATE, "checkClusterStatus").resolves(cluster.name)
       checkClusterDeleteStatusStub = sinon.stub(CLUSTER_STATE, "checkClusterDeleteStatus").resolves("DELETNG")
       sendResponseStub = sinon.stub(SR, "sendResponse").resolves()
    })

    this.beforeEach(() => {
        createClusterStub.resetHistory()
        updateClusterStub.resetHistory()
        deleteClusterStub.resetHistory()
        fetchClusterStub.resetHistory()
        checkClusterStatusStub.resetHistory()
        checkClusterDeleteStatusStub.resetHistory()
        sendResponseStub.resetHistory()
    })

    this.afterAll(() => {
        createClusterStub.restore()
        updateClusterStub.restore()
        deleteClusterStub.restore()
        fetchClusterStub.restore()
        checkClusterStatusStub.restore()
        checkClusterDeleteStatusStub.restore()
        sendResponseStub.restore()
    })

    it("Should call createCluster when RequestType is Create and pass the event and context object", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(createClusterStub.calledOnce).to.be.true
        expect(createClusterStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should invoke checkClusterStatus", async () => {
        event.RequestType = "Create"
        await handler(event, context)
        expect(checkClusterStatusStub.calledOnce).to.be.true
        expect(checkClusterStatusStub.getCall(0).args[0]).to.deep.equal(event)
        expect(checkClusterStatusStub.getCall(0).args[1]).to.deep.equal(60000)
    })

    it("Should call updateCluster when RequestType is 'Update' and pass the event and context object", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(updateClusterStub.calledOnce).to.be.true
        expect(updateClusterStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should invoke checkClusterStatus", async () => {
        event.RequestType = "Update"
        await handler(event, context)
        expect(checkClusterStatusStub.calledOnce).to.be.true
        expect(checkClusterStatusStub.getCall(0).args[0]).to.deep.equal(event)
        expect(checkClusterStatusStub.getCall(0).args[1]).to.deep.equal(60000)
    })

    it("Should call deletCluster when RequestType is 'Delete' and pass the event and context object", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(deleteClusterStub.calledOnce).to.be.true
        expect(deleteClusterStub.getCall(0).args[0]).to.deep.equal(event)
    })

    it("Should invoke checkClusterDeleteStatus", async () => {
        event.RequestType = "Delete"
        await handler(event, context)
        expect(checkClusterDeleteStatusStub.calledOnce).to.be.true
        expect(checkClusterDeleteStatusStub.getCall(0).args[0]).to.deep.equal(event)
        expect(checkClusterDeleteStatusStub.getCall(0).args[1]).to.deep.equal(60000)
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
        createClusterStub.rejects()
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
        createClusterStub.returns(new Promise((resolve) => setTimeout(() => resolve(cluster), 100)))

        await handler(event, context)

        const wasCalled = sendResponseStub.getCalls().find(call => call.firstArg.testProp == "true")
        expect(wasCalled).not.to.be.undefined
        expect(wasCalled.args[2]).to.equal("FAILED")
    })
})