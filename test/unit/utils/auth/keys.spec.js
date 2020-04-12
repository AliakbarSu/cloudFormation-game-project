// const { fetchKeys } = require('../../../../src/opt/nodejs/utils/auth/keys')

// const chai = require('chai')
// const expect = chai.expect
// const sinon = require("sinon")
// const axios = require('axios')
// const MockAdapter = require("axios-mock-adapter");



// describe("Utils:Auth:keys", function() {
//     let axiosMock
//     const keys = [{kid: "key1"}, {kid: "key2"}]

//     this.beforeAll(() => {
//         axiosMock = new MockAdapter(axios);

//         axiosMock.onGet()
//         .reply(200, keys)
//     })

//     this.beforeEach(() => {
//         axiosMock.resetHistory()
//     })

//     this.afterAll(() => {
//         axiosMock.restore()
//     })

//     it("Should throw error if keys_url is not provided or is invalid", async () => {
//         try {
//             await fetchKeys(null)
//         }catch(err) {
//             expect(err.message).to.equal("NO_KEYS_URL_PROVIDED")
//         }
//     })

//     it("Should make a get http request", async () => {
//         await fetchKeys("test_url")
//         expect(axiosMock.history.get.length).to.equal(1)
//     })

//     it("Should make get http request to the correct url", async () => {
//         const url = `test_url_keys`
//         await fetchKeys(url)
//         axiosMock.onPost(url).reply(200, {_id: "ok"})
//         expect(axiosMock.history.get.length).to.equal(1)
//     })

//     it("Should return the keys", async () => {
//         const result = await fetchKeys("test_url")
//         expect(result).to.deep.equal(keys)
//     })
// })