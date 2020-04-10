const { 
    createGroup, 
    updateGroup, 
    deleteGroup } = require('../../../../../src/mongoDBAtlas/group/group')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const AxiosDigest = require('axios-digest').AxiosDigest



describe("Group::group", function() {
    let digestPostStub, digestPatchStub, digestDeleteStub;

    let event = {
        PhysicalResourceId: "test_group_id",
        orgId: "test_id",
        name: "test_group",
    }
    
    

    const group = {
        id: "test_group_id",
        name: "test_group"
    }

    

    this.beforeAll(() => {
        digestPostStub = sinon.stub(AxiosDigest.prototype, "post").resolves()
        digestPatchStub = sinon.stub(AxiosDigest.prototype, "patch").resolves()
        digestDeleteStub = sinon.stub(AxiosDigest.prototype, "delete").resolves()
    })

    this.beforeEach(() => {
        digestPostStub.resetHistory()
        digestPatchStub.resetHistory()
        digestDeleteStub.resetHistory()
        digestPostStub.resolves({data: group})
        digestPatchStub.resolves({data: group})
        digestDeleteStub.resolves({data: group})
    })

    this.afterAll(() => {
        digestPostStub.restore()
        digestPatchStub.restore()
        digestDeleteStub.restore()
    })

    describe("createGroup", function() {
        it("Should throw error if orgId is not provided or is invalid", async () => {
            try {
                await createGroup(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await createGroup({...event, orgId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a post request and pass the correct params", async () => {
            await createGroup(event)
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[1].name).to.equal(event.name)
            expect(digestPostStub.getCall(0).args[1].provideName).to.equal(event.provideName)
        })
    
        it("Should make a post request to the correct endpoint", async () => {
            await createGroup(event)
            const url = "https://cloud.mongodb.com/api/atlas/v1.0/groups"
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the created group object", async () => {
            const createdGroup = await createGroup(event)
            expect(createdGroup).to.deep.equal(group)
        })
    })


    describe("deleteGroup", function() {
        it("Should throw error if event or event.PhysicalResourceId is not provided or is invalid", async () => {
            try {
                await deleteGroup(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await deleteGroup({...event, PhysicalResourceId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a delete request", async () => {
            await deleteGroup(event)
            expect(digestDeleteStub.calledOnce).to.be.true
        })
    
        it("Should make a delete request to the correct endpoint", async () => {
            await deleteGroup(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.PhysicalResourceId}`
            expect(digestDeleteStub.calledOnce).to.be.true
            expect(digestDeleteStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return null when group is deleted", async () => {
            const createdGroup = await deleteGroup(event)
            expect(createdGroup).to.deep.equal(null)
        })
    })
})