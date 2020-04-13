const { 
    split,
    parse,
    decode,
    getKid,
    invalidTokenError,
    extractKeySafe
 } = require('../../../../src/opt/nodejs/utils/auth/kid-extractor')

const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


// mockJose = {
//     util: {
//         base64url: {
//             decode: fake.returns(JSON.stringify({kid: kid}))
//         }
//     }
// }


describe("Utils:Auth:kid-extractor", function() {
    let token

    token = "xglXdTuw0gTjJWT41CEEg2hNuVAiIEdQkTk.H-839dSn9BRYyxu5UZ7xYA"


    describe("split", function() {
        it("split string into an array at . delimator and return the first slice", () => {
            const firstPart = "firstpart"
            const secondPart = "secondpart"
            const mockToken = firstPart + "." + secondPart
            expect(split(mockToken)).to.equal(firstPart)
        })
    })

    describe("decode", function() {
        const mockJsonObject = {"key": "value"}
        const decoderStub = () => mockJsonObject

        it("Should resolve to a json object", (done) => {
            expect(decode(decoderStub, "")).to.become(mockJsonObject).notify(done)
        })

        it("Should reject when decoder fails", (done) => {
            const mockError = new Error("test_error")
            const decoderStub = () => {throw mockError}
            expect(decode(decoderStub, "")).to.rejectedWith(mockError).notify(done)
        })
    })

    describe("parse", function() {
        it("Should return a javascript object", () => {
            const mockObject = {key: "value"}
            const mockJsonObject = {"key": "value"}
            const parserStub = fake.returns(mockObject)
            expect(parse(parserStub, mockJsonObject)).to.deep.equal(mockObject)
            expect(parserStub.calledOnce).to.be.true
            expect(parserStub.getCall(0).args[0]).to.deep.equal(mockJsonObject)
        })
    })

    describe("getKid", function() {
        it("Should return the kid property", () => {
            const mockObject = {kid: "testValue"}
            expect(getKid(mockObject)).to.equal("testValue")
        })
    })

    describe("extractKeySafe", function() {
        let mockJsonObject, decoderStub,
        parserStub, mockObject
        
        this.beforeEach(() => {
            mockJsonObject = {"kid": "value"}
            mockObject = {kid: "value"}
            decoderStub = () => mockJsonObject
            parserStub = sinon.fake.returns(mockObject)
        })

        it("Should resolve to the correct kid", (done) => {
            expect(extractKeySafe(decoderStub, parserStub, "validToken")).to.become(mockObject.kid).notify(done)
        })

        it("Should reject if token is invalid", (done) => {
            expect(extractKeySafe(decoderStub, parserStub, null)).to.rejected.notify(done)
        })
    })

    describe("invalidTokenError", function() {
        it("Should create a new error object", () => {
            expect(invalidTokenError().message).to.equal("INVALID_TOKEN_PROVIDED")
        })
    })
})
