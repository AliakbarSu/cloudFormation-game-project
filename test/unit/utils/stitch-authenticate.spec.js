const { authenticate } = require('../../../src/opt/nodejs/utils/stitch-authenticate')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const axios = require('axios')
var MockAdapter = require("axios-mock-adapter");


describe("Utils::stitch-authenticate", function() {
    let axiosMock;
    
    const authResult = {
        access_token: "test_token"
    }

    const apiKey = "test_api_key"
    const secretKey = "test_secret_key"

    this.beforeAll(() => {
        axiosMock = new MockAdapter(axios);
        axiosMock.onPost("https://stitch.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login")
        .reply(200, authResult)
    })

    this.beforeEach(() => {
        axiosMock.resetHistory()
    })

    this.afterAll(() => {
        axiosMock.restore()
    })

    it("Should make a post request and pass the correct params", async () => {
        const access_token = await authenticate(apiKey, secretKey)
        expect(axiosMock.history.post.length).to.equal(1)
        const expectedParams = {
            username: apiKey,
            apiKey: secretKey
        }
        expect(axiosMock.history.post[0].data).to.equal(JSON.stringify(expectedParams))
        expect(access_token).to.equal(authResult.access_token)
    })

    it("Should make http request to correct endpoint", async () => {
        await authenticate(apiKey, secretKey)
        expect(axiosMock.history.post.length).to.equal(1)
    })

    it("Should throw error if apiKey or secretKey is not provided or is invalid", async () => {
        try {
            await authenticate(null, secretKey)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(axiosMock.history.post.length).to.equal(0)
            expect(err.message).to.equal("INVALID_CREDENTIALS")
        }

        try {
            await authenticate(apiKey, null)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(axiosMock.history.post.length).to.equal(0)
            expect(err.message).to.equal("INVALID_CREDENTIALS")
        }
    })
})