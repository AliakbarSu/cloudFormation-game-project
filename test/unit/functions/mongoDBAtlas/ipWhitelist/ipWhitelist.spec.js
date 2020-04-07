const { 
    createIp, 
    updateIp, 
    deleteIp } = require('../../../../../src/mongoDBAtlas/ipWhitelist/ipWhitelist')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const AxiosDigest = require('axios-digest').AxiosDigest



describe("IpWhitelist::ipWhitelist", function() {
    let digestPostStub, digestDeleteStub;

    let event = {
        PhysicalResourceId: "test_ip_address",
        groupId: "test_group_id",
        ipAddress: "1.1.1.1.1",
    }
    
    

    const ip = {
        id: "test_ip_address",
        ipAddress: "1.1.1.1.1"
    }

    

    this.beforeAll(() => {
        digestPostStub = sinon.stub(AxiosDigest.prototype, "post").resolves()
        digestDeleteStub = sinon.stub(AxiosDigest.prototype, "delete").resolves()
    })

    this.beforeEach(() => {
        digestPostStub.resetHistory()
        digestDeleteStub.resetHistory()
        digestPostStub.resolves({data:{results: [ip]}})
        digestDeleteStub.resolves({data:{results: [ip]}})
    })

    this.afterAll(() => {
        digestPostStub.restore()
        digestDeleteStub.restore()
    })

    describe("createIp", function() {
        it("Should throw error if groupId is not provided or is invalid", async () => {
            try {
                await createIp(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await createIp({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a post request and pass the correct params", async () => {
            await createIp(event)
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[1][0].ipAddress).to.equal(event.ipAddress)
        })
    
        it("Should make a post request to the correct endpoint", async () => {
            await createIp(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/whitelist`
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the created ip object", async () => {
            const createdIp = await createIp(event)
            expect(createdIp).to.deep.equal({ipAddress: ip.ipAddress})
        })
    })


    describe("updateIp", function() {
        it("Should throw error if event or groupId is not provided or is invalid", async () => {
            try {
                await updateIp(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await updateIp({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a post request and pass the correct params", async () => {
            await updateIp(event)
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[1][0].ipAddress).to.equal(event.ipAddress)
        })
    
        it("Should make a post request to the correct endpoint", async () => {
            await updateIp(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/whitelist`
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the update ip object", async () => {
            const createdIp = await createIp(event)
            expect(createdIp).to.deep.equal({ipAddress: ip.ipAddress})
        })
    })

    describe("deleteIp", function() {
        it("Should throw error if event, groupId, or event.PhysicalResourceId is not provided or is invalid", async () => {
            try {
                await deleteIp(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await deleteIp({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await deleteIp({...event, PhysicalResourceId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a delete request", async () => {
            await deleteIp(event)
            expect(digestDeleteStub.calledOnce).to.be.true
        })
    
        it("Should make a delete request to the correct endpoint", async () => {
            await deleteIp(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/whitelist/${event.PhysicalResourceId}`
            expect(digestDeleteStub.calledOnce).to.be.true
            expect(digestDeleteStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the deleted ip object", async () => {
            const createdIp = await deleteIp(event)
            expect(createdIp).to.deep.equal({ipAddress: ip.ipAddress})
        })
    })
})