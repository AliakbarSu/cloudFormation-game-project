const { 
    createDatabaseUser, 
    updateDatabaseUser, 
    deleteDatabaseUser } = require('../../../../../src/mongoDBAtlas/databaseUser/databaseUser')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const AxiosDigest = require('axios-digest').AxiosDigest



describe("DatabaseUser::databaseUser", function() {
    let digestPostStub, digestPatchStub, digestDeleteStub;

    let event = {
        PhysicalResourceId: "test_user_name",
        groupId: "test_group_id",
        username: "test_user",
        password: "test_password"
    }
    
    

    const user = {
        id: "test_user_id",
        username: "test_user",
        password: event.password
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
        digestPostStub.resolves({data: user})
        digestPatchStub.resolves({data: user})
        digestDeleteStub.resolves({data: user})
    })

    this.afterAll(() => {
        digestPostStub.restore()
        digestPatchStub.restore()
        digestDeleteStub.restore()
    })

    describe("createDatabaseUser", function() {
        it("Should throw error if groupId is not provided or is invalid", async () => {
            try {
                await createDatabaseUser(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await createDatabaseUser({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPostStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a post request and pass the correct params", async () => {
            await createDatabaseUser(event)
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[1].name).to.equal(event.name)
            expect(digestPostStub.getCall(0).args[1].provideName).to.equal(event.provideName)
        })
    
        it("Should make a post request to the correct endpoint", async () => {
            await createDatabaseUser(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/databaseUsers`
            expect(digestPostStub.calledOnce).to.be.true
            expect(digestPostStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the created user object", async () => {
            const createdDatabaseUser = await createDatabaseUser(event)
            expect(createdDatabaseUser).to.deep.equal(user)
        })
    })


    describe("updateDatabaseUser", function() {
        it("Should throw error if event, groupId, or event.PhysicalResourceId is not provided or is invalid", async () => {
            try {
                await updateDatabaseUser(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPatchStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await updateDatabaseUser({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPatchStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await updateDatabaseUser({...event, PhysicalResourceId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestPatchStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a patch request and pass the correct params", async () => {
            await updateDatabaseUser(event)
            expect(digestPatchStub.calledOnce).to.be.true
            expect(digestPatchStub.getCall(0).args[1].name).to.equal(event.name)
            expect(digestPatchStub.getCall(0).args[1].provideName).to.equal(event.provideName)
        })
    
        it("Should make a patch request to the correct endpoint", async () => {
            await updateDatabaseUser(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/databaseUsers/${event.PhysicalResourceId}`
            expect(digestPatchStub.calledOnce).to.be.true
            expect(digestPatchStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the update user object", async () => {
            const createdDatabaseUser = await createDatabaseUser(event)
            expect(createdDatabaseUser).to.deep.equal(user)
        })
    })

    describe("deleteDatabaseUser", function() {
        it("Should throw error if event, groupId, or event.PhysicalResourceId is not provided or is invalid", async () => {
            try {
                await deleteDatabaseUser(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await deleteDatabaseUser({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await deleteDatabaseUser({...event, PhysicalResourceId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(digestDeleteStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should make a delete request", async () => {
            await deleteDatabaseUser(event)
            expect(digestDeleteStub.calledOnce).to.be.true
        })
    
        it("Should make a delete request to the correct endpoint", async () => {
            await deleteDatabaseUser(event)
            const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${event.groupId}/databaseUsers/${event.PhysicalResourceId}`
            expect(digestDeleteStub.calledOnce).to.be.true
            expect(digestDeleteStub.getCall(0).args[0]).to.equal(url)
        })
    
        it("Should return the deleted user object", async () => {
            const createdDatabaseUser = await deleteDatabaseUser(event)
            expect(createdDatabaseUser).to.deep.equal(user)
        })
    })
})