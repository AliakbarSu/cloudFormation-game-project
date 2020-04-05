const CLUSTER = require('../../../../../src/mongoDBAtlas/cluster/cluster')
const { checkClusterStatus } = require('../../../../../src/mongoDBAtlas/cluster/clusterState') 

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')


describe("Cluster::index::checkClusterStatus", function() {

    let fetchClusterStub

    let event = { groupId: "test_group", name: "test"}
    let cluster = {stateName: 'creating', name: "test_cluster"}

    this.beforeAll(() => {
        fetchClusterStub = sinon.stub(CLUSTER, "fetchCluster").resolves(cluster)
    })

    this.beforeEach(() => {
        fetchClusterStub.resetHistory()
    })

    this.afterAll(() => {
        fetchClusterStub.restore()
    })

    it("Should invoke fetchCluster 2 times", async () => {
        await Promise.race([checkClusterStatus(event, 50, 2), new Promise((r) => setTimeout(r, 110))])
        expect(fetchClusterStub.calledTwice).to.be.true
    })

    it("Should invoke fetchCluster 2 times when fetchingCluster fails", async () => {
        await Promise.race([checkClusterStatus(event, 50, 2), new Promise((r) => setTimeout(r, 110))])
        expect(fetchClusterStub.calledTwice).to.be.true
    })

    it("Should invoke fetchCluster 1 time", async () => {
        fetchClusterStub.resolves({...cluster, stateName: "idle"})
        await Promise.race([checkClusterStatus(event, 50, 1), new Promise((r) => setTimeout(r, 60))])
        expect(fetchClusterStub.calledOnce).to.be.true
    })
})