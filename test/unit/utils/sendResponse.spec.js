const { sendResponse } = require("../../../src/opt/nodejs/utils/sendResponse")

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const axios = require('axios')
var MockAdapter = require("axios-mock-adapter");



describe("Layer::SendResponse", function() {
    let event, context, responseStatus, responseData, returnedResponse;
    
    event = {
        StackId: "test_stack",
        RequestId: "test_request",
        LogicalResourceId: "test_logical_resource_id",
        PhysicalResourceId: "test_physical_resource_id",
        ResponseURL: "test_response_url"
    }

    context = {}
    responseStatus = 200
    responseData = {}

    returnedResponse = {status: "ok"}

    this.beforeAll(() => {
        axiosMock = new MockAdapter(axios);
        axiosMock.onPut()
        .reply(200, returnedResponse)
    })

    this.beforeEach(() => {
        axiosMock.resetHistory()
    })

    this.afterAll(() => {
        axiosMock.restore()
    })

    it("Should throw error if any of the required args is missing", async () => {
        try {
            await sendResponse(null, context, responseStatus, responseData)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(axiosMock.history.put.length).to.equal(0)
            expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
        }

        try {
            await sendResponse(event, null, responseStatus, responseData)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(axiosMock.history.put.length).to.equal(0)
            expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
        }

        try {
            await sendResponse(event, context, null, responseData)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(axiosMock.history.put.length).to.equal(0)
            expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
        }

        try {
            await sendResponse(event, context, responseStatus, null)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(axiosMock.history.put.length).to.equal(0)
            expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
        }
    })

    it("Should make a put request and pass the correct params", async () => {
        await sendResponse(event, context, responseStatus, responseData)
        expect(axiosMock.history.put.length).to.equal(1)
        expect(JSON.parse(axiosMock.history.put[0].data).Status).to.equal(responseStatus)
        expect(JSON.parse(axiosMock.history.put[0].data).LogicalResourceId).to.equal(event.LogicalResourceId)
        expect(JSON.parse(axiosMock.history.put[0].data).Data).to.deep.equal(responseData)
    })

    it("Should make http request to correct endpoint", async () => {
        axiosMock.reset()
        axiosMock.onPut(event.ResponseURL).reply(200)
        await sendResponse(event, context, responseStatus, responseData)
        expect(axiosMock.history.put.length).to.equal(1)
    })

    it("Should make put request for 3 times then throw error", async () => {
        axiosMock.reset()
        axiosMock.onPut(event.ResponseURL).reply(400)
        try {
            await sendResponse(event, context, responseStatus, responseData)
        }catch(err) {
            expect(axiosMock.history.put.length).to.equal(3)
        }
    })

})