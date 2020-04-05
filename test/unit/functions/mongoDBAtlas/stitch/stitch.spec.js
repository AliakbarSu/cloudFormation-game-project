const { 
    createStitchApp, 
    updateStitchApp, 
    deleteStitchApp } = require('../../../../../src/mongoDBAtlas/stitch/stitch')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const axios = require('axios')
var MockAdapter = require("axios-mock-adapter");
const UTIL = require('../../../../../src/opt/nodejs/utils/stitch-authenticate')



 describe("StitchApp", function() {
    let stitchAuthenticateStub;
    let authToken = "test_auth_token"
    let event = {
        PhysicalResourceId: "test_stitch_id",
        groupId: "test_group_id",
        name: "test_stitchApp",
    }

    const createdApp = {
        _id: "test_stitch_app"
    }

    this.beforeAll(() => {
        axiosMock = new MockAdapter(axios);
        axiosMock.onPost()
        .reply(200, createdApp)

        axiosMock.onPatch()
        .reply(200, createdApp)

        axiosMock.onDelete()
        .reply(200, createdApp)

        stitchAuthenticateStub = sinon.stub(UTIL, "authenticate").resolves(authToken)
    })

    this.beforeEach(() => {
        axiosMock.resetHistory()
        stitchAuthenticateStub.resetHistory()
    })

    this.afterAll(() => {
        axiosMock.restore()
        stitchAuthenticateStub.restore()
    })

    describe("createStitchApp", function() {
        it("Should throw error if event or event.groupId is not provided or is invalid", 
        async () => {
            try {
                await createStitchApp(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.post.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await createStitchApp({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.post.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })

        it("Should invoke stitch-authenticate and path API_KEY and SECRET_KEY", async () => {
            const testApiKey = "test_key"
            const testSecretKey = "test_secret"
            process.env.API_KEY = testApiKey
            process.env.SECRET_KEY = testSecretKey
            await createStitchApp(event)
            expect(stitchAuthenticateStub.calledOnce).to.be.true
            expect(stitchAuthenticateStub.getCall(0).args[0]).equal(testApiKey)
            expect(stitchAuthenticateStub.getCall(0).args[1]).equal(testSecretKey)
        })

        it("Should make a post request and pass the correct params", async () => {
            await createStitchApp(event)
            expect(axiosMock.history.post.length).to.equal(1)
            expect(JSON.parse(axiosMock.history.post[0].data).name).equal(event.name)
            expect(JSON.parse(axiosMock.history.post[0].data)).not.to.have.property("PhysicalResourceId")
            expect(axiosMock.history.post[0].headers.Authorization).to.equal("Bearer " + authToken)
        })

        it("Should make http request to correct endpoint", async () => {
            const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${event.groupId}/apps`
            axiosMock.onPost(url).reply(200, {_id: "ok"})
            await createStitchApp(event)
            expect(axiosMock.history.post.length).to.equal(1)
        })
    })

    describe("updateStitchApp", function() {
        it("Should throw error if event or event.PhysicalResourceId is not provided or is invalid", 
        async () => {
            try {
                await updateStitchApp(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.patch.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await updateStitchApp({...event, PhysicalResourceId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.patch.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })

        it("Should invoke stitch-authenticate and path API_KEY and SECRET_KEY", async () => {
            const testApiKey = "test_key"
            const testSecretKey = "test_secret"
            process.env.API_KEY = testApiKey
            process.env.SECRET_KEY = testSecretKey
            await updateStitchApp(event)
            expect(stitchAuthenticateStub.calledOnce).to.be.true
            expect(stitchAuthenticateStub.getCall(0).args[0]).equal(testApiKey)
            expect(stitchAuthenticateStub.getCall(0).args[1]).equal(testSecretKey)
        })

        it("Should make an update request and pass the correct params", async () => {
            await updateStitchApp(event)
            expect(axiosMock.history.patch.length).to.equal(1)
            expect(JSON.parse(axiosMock.history.patch[0].data).name).equal(event.name)
            expect(JSON.parse(axiosMock.history.patch[0].data)).not.to.have.property("PhysicalResourceId")
            expect(axiosMock.history.patch[0].headers.Authorization).to.equal("Bearer " + authToken)
        })

        it("Should make an update request to correct endpoint", async () => {
            const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${event.groupId}/apps/${event.PhysicalResourceId}`
            axiosMock.onPatch(url).reply(200, {_id: "ok"})
            await updateStitchApp(event)
            expect(axiosMock.history.patch.length).to.equal(1)
        })
    })

    describe("deleteStitchApp", function() {
        it("Should throw error if event or event.PhysicalResourceId is not provided or is invalid", 
        async () => {
            try {
                await deleteStitchApp(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.delete.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await deleteStitchApp({...event, PhysicalResourceId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.delete.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })

        it("Should invoke stitch-authenticate and path API_KEY and SECRET_KEY", async () => {
            const testApiKey = "test_key"
            const testSecretKey = "test_secret"
            process.env.API_KEY = testApiKey
            process.env.SECRET_KEY = testSecretKey
            await deleteStitchApp(event)
            expect(stitchAuthenticateStub.calledOnce).to.be.true
            expect(stitchAuthenticateStub.getCall(0).args[0]).equal(testApiKey)
            expect(stitchAuthenticateStub.getCall(0).args[1]).equal(testSecretKey)
        })

        it("Should make a delete request and pass the correct params", async () => {
            await deleteStitchApp(event)
            expect(axiosMock.history.delete.length).to.equal(1)
        })

        it("Should make delete request to correct endpoint", async () => {
            const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${event.groupId}/apps/${event.PhysicalResourceId}`
            axiosMock.onDelete(url).reply(200, {_id: "ok"})
            await deleteStitchApp(event)
            expect(axiosMock.history.delete.length).to.equal(1)
        })
    })
})