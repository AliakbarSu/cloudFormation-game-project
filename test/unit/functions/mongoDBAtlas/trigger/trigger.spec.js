const { 
    createEventTrigger, 
    updateEventTrigger, 
    deleteEventTrigger } = require('../../../../../src/mongoDBAtlas/trigger/trigger')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const axios = require('axios')
var MockAdapter = require("axios-mock-adapter");
const UTIL = require('../../../../../src/opt/nodejs/utils/stitch-authenticate')



 describe("Trigger::trigger", function() {
    let stitchAuthenticateStub;
    let authToken = "test_auth_token"
    let event = {
        PhysicalResourceId: "test_trigger_id",
        groupId: "test_group_id",
        appId: "test_app_id",
        name: "test_event_trigger",
    }

    const createdTrigger = {
        _id: "test_event_trigger_id"
    }

    this.beforeAll(() => {
        axiosMock = new MockAdapter(axios);

        axiosMock.onGet()
        .reply(200, createdTrigger)

        axiosMock.onPost()
        .reply(200, createdTrigger)

        axiosMock.onPut()
        .reply(200, createdTrigger)

        axiosMock.onDelete()
        .reply(200, createdTrigger)

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

    describe("createEventTrigger", function() {
        it("Should throw error if event is not provided or is invalid", 
        async () => {
            try {
                await createEventTrigger(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.post.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await createEventTrigger({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.post.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await createEventTrigger({...event, appId: null})
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
            await createEventTrigger(event)
            expect(stitchAuthenticateStub.calledOnce).to.be.true
            expect(stitchAuthenticateStub.getCall(0).args[0]).equal(testApiKey)
            expect(stitchAuthenticateStub.getCall(0).args[1]).equal(testSecretKey)
        })

        it("Should make a post request and pass the correct params", async () => {
            await createEventTrigger(event)
            expect(axiosMock.history.post.length).to.equal(1)
            expect(JSON.parse(axiosMock.history.post[0].data).name).equal(event.name)
            expect(JSON.parse(axiosMock.history.post[0].data)).not.to.have.property("PhysicalResourceId")
            expect(axiosMock.history.post[0].headers.Authorization).to.equal("Bearer " + authToken)
        })

        it("Should make http request to correct endpoint", async () => {
            const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${event.groupId}/apps/${event.appId}/triggers`
            axiosMock.onPost(url).reply(200, {_id: "ok"})
            await createEventTrigger(event)
            expect(axiosMock.history.post.length).to.equal(1)
        })
    })

    describe("updateEventTrigger", function() {
        it("Should throw error if event  is not provided or is invalid", 
        async () => {
            try {
                await updateEventTrigger(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.patch.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await updateEventTrigger({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.patch.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await updateEventTrigger({...event, appId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.patch.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await updateEventTrigger({...event, PhysicalResourceId: null})
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
            await updateEventTrigger(event)
            expect(stitchAuthenticateStub.calledOnce).to.be.true
            expect(stitchAuthenticateStub.getCall(0).args[0]).equal(testApiKey)
            expect(stitchAuthenticateStub.getCall(0).args[1]).equal(testSecretKey)
        })

        it("Should make an update request and pass the correct params", async () => {
            await updateEventTrigger(event)
            expect(axiosMock.history.put.length).to.equal(1)
            expect(JSON.parse(axiosMock.history.put[0].data).name).equal(event.name)
            expect(JSON.parse(axiosMock.history.put[0].data)).not.to.have.property("PhysicalResourceId")
            expect(axiosMock.history.put[0].headers.Authorization).to.equal("Bearer " + authToken)
        })

        it("Should make an update request to correct endpoint", async () => {
            const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${event.groupId}/apps/${event.appId}/triggers/${event.PhysicalResourceId}`
            axiosMock.onPut(url).reply(200, {_id: "ok"})
            await updateEventTrigger(event)
            expect(axiosMock.history.put.length).to.equal(1)
        })
    })

    describe("deleteEventTrigger", function() {
        it("Should throw error if event is not provided or is invalid", 
        async () => {
            try {
                await deleteEventTrigger(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.delete.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await deleteEventTrigger({...event, groupId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.delete.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await deleteEventTrigger({...event, appId: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(axiosMock.history.delete.length).to.equal(0)
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await deleteEventTrigger({...event, PhysicalResourceId: null})
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
            await deleteEventTrigger(event)
            expect(stitchAuthenticateStub.calledOnce).to.be.true
            expect(stitchAuthenticateStub.getCall(0).args[0]).equal(testApiKey)
            expect(stitchAuthenticateStub.getCall(0).args[1]).equal(testSecretKey)
        })

        it("Should make a delete request and pass the correct params", async () => {
            await deleteEventTrigger(event)
            expect(axiosMock.history.delete.length).to.equal(1)
        })

        it("Should make delete request to correct endpoint", async () => {
            const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${event.groupId}/apps/${event.appId}/triggers/${event.PhysicalResourceId}`
            axiosMock.onDelete(url).reply(200, {_id: "ok"})
            await deleteEventTrigger(event)
            expect(axiosMock.history.delete.length).to.equal(1)
        })
    })
})