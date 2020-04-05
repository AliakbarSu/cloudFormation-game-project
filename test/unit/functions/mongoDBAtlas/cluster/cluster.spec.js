const { 
    createCluster, 
    updateCluster, 
    deleteCluster,
    fetchCluster } = require('../../../../../src/mongoDBAtlas/cluster/cluster')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const AxiosDigest = require('axios-digest').AxiosDigest



describe("Cluster::cluster", function() {
    let digestPostStub, digestPatchStub, digestDeleteStub, digestGetStub;

    let event = {
        PhysicalResourceId: "test_cluster",
        groupId: "test_group",
        name: "test_cluster",
        providerName: "test_provider"
    }
    
    

    const cluster = {
        _id: "test_group_id",
        name: "test_cluster",
        stateName: "creating"
    }

    

    this.beforeAll(() => {
        digestPostStub = sinon.stub(AxiosDigest.prototype, "post").resolves()
        digestPatchStub = sinon.stub(AxiosDigest.prototype, "patch").resolves()
        digestDeleteStub = sinon.stub(AxiosDigest.prototype, "delete").resolves()
        digestGetStub = sinon.stub(AxiosDigest.prototype, "get").resolves()
    })

    this.beforeEach(() => {
        digestPostStub.resetHistory()
        digestPatchStub.resetHistory()
        digestDeleteStub.resetHistory()
        digestGetStub.resetHistory()
        digestPostStub.resolves({data: cluster})
        digestPatchStub.resolves({data: cluster})
        digestDeleteStub.resolves({data: cluster})
        digestGetStub.resolves({data: cluster})
    })

    this.afterAll(() => {
        digestPostStub.restore()
        digestPatchStub.restore()
        digestDeleteStub.restore()
        digestGetStub.restore()
    })

    describe("fetchCluster", function() {
        it("Should throw error if groupId is not provided or is invalid", async () => {
            try {
                await fetchCluster(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestGetStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await fetchCluster({...event, groupId: null, })
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestGetStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await fetchCluster({...event, name: null, })
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestGetStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a post request and pass the correct params", async () => {
            await fetchCluster(event)
            expect(digestGetStub.calledOnce).to.be.true
        })
    
        it("Should make a post request to the correct endpoint", async () => {
            await fetchCluster(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/clusters/${event.name}`
            expect(digestGetStub.calledOnce).to.be.true
            expect(digestGetStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the created cluster object", async () => {
            const fetchedCluster = await fetchCluster(event)
            expect(fetchedCluster).to.deep.equal(cluster)
        })
    })

    describe("createCluster", function() {
        it("Should throw error if groupId is not provided or is invalid", async () => {
            try {
                await createCluster(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await createCluster({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a post request and pass the correct params", async () => {
            await createCluster(event)
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[1].name).to.equal(event.name)
            expect(digestPostStub.getCall(0).args[1].provideName).to.equal(event.provideName)
        })
    
        it("Should make a post request to the correct endpoint", async () => {
            await createCluster(event)
            const url = "https://cloud.mongodb.com/api/atlas/v1.0/groups/" + event.groupId + "/clusters"
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the created cluster object", async () => {
            const createdCluster = await createCluster(event)
            expect(createdCluster).to.deep.equal(cluster)
        })
    })


    describe("updateCluster", function() {
        it("Should throw error if groupId is not provided or is invalid", async () => {
            try {
                await updateCluster(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPatchStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await updateCluster({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPatchStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a patch request and pass the correct params", async () => {
            await updateCluster(event)
            expect(digestPatchStub.calledOnce).to.be.true
            expect(digestPatchStub.getCall(0).args[1].name).to.equal(event.name)
            expect(digestPatchStub.getCall(0).args[1].provideName).to.equal(event.provideName)
        })
    
        it("Should make a patch request to the correct endpoint", async () => {
            await updateCluster(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/clusters/${event.PhysicalResourceId}`
            expect(digestPatchStub.calledOnce).to.be.true
            expect(digestPatchStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the updated cluster object", async () => {
            const createdCluster = await createCluster(event)
            expect(createdCluster).to.deep.equal(cluster)
        })
    })

    describe("deleteCluster", function() {
        it("Should throw error if groupId is not provided or is invalid", async () => {
            try {
                await deleteCluster(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await deleteCluster({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a delete request", async () => {
            await deleteCluster(event)
            expect(digestDeleteStub.calledOnce).to.be.true
        })
    
        it("Should make a delete request to the correct endpoint", async () => {
            await deleteCluster(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/clusters/${event.PhysicalResourceId}`
            expect(digestDeleteStub.calledOnce).to.be.true
            expect(digestDeleteStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the deleted cluster object", async () => {
            const createdCluster = await deleteCluster(event)
            expect(createdCluster).to.deep.equal(cluster)
        })
    })
})