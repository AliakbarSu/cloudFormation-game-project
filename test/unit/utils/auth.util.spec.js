let layerPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    layerPath = "/opt/nodejs/"
}


const authUtils = require(layerPath + 'utils/auth.util')
const CONSTANTS = require(layerPath + 'constants')

const fetch = require('node-fetch');
const jose = require('node-jose');
const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")



describe("Auth Utils", function() {
    describe("parseToken", function() {

        let decodeStub, parseToken, mockFetch,
        asKeyStub, createVerifyStub, verifyStub;
        let token = "xglXdTuw0gTjJWT41CEEg2hNuVAiIEdQkTk.H-839dSn9BRYyxu5UZ7xYA"
        let mockHeader, mockClaims, keys

        let deps = {
            jose, 
            CONSTANTS, 
            fetch: mockFetch
        }

        this.beforeAll(() => {
            asKeyStub = sinon.stub(jose.JWK, "asKey").resolves()
            createVerifyStub = sinon.stub(jose.JWS, "createVerify")
            decodeStub = sinon.stub(jose.util.base64url, "decode")
        })

        this.beforeEach(() => {
            mockHeader = {
                kid: "TEST_KID"
            }

            mockClaims = {
                aud: "TEST_AUD",
                exp: 2424535646
            }

            keys = [{kid: mockHeader.kid}]
            CONSTANTS.COGNITO_USER_POOL_CLIENT = mockClaims.aud

            mockFetch = sinon.fake.resolves({json: () => ({keys}), ok: true})
            deps.fetch = mockFetch

            verifyStub = sinon.fake.resolves({payload: JSON.stringify(mockClaims)})
            decodeStub.returns(JSON.stringify(mockHeader))
            createVerifyStub.returns({verify: verifyStub})

            parseToken = authUtils.ParseToken(deps)
            deps.fetch.resetHistory()
            asKeyStub.resetHistory()
            verifyStub.resetHistory()
            createVerifyStub.resetHistory()
            decodeStub.resetHistory()
        })

        this.afterAll(() => {
            asKeyStub.restore()
            createVerifyStub.restore()
            decodeStub.restore()
        })

        it("Should throw error if token is null", async () => {
            try {
                await parseToken(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("TOKEN_IS_NULL")
            }
        })

        it("Should call jose.util.base64url.decode", async () => {
            await parseToken(token)
            expect(decodeStub.calledOnce).to.be.true
        })

        it("Should call fetch and pass keys url", async () => {
            const testKeysUrl = "TEST_KEYS_URL"
            CONSTANTS.KEYS_URL = testKeysUrl
            await parseToken(token)
            expect(deps.fetch.calledOnce).to.be.true
            expect(deps.fetch.getCall(0).args[0]).to.equal(testKeysUrl)
        })

        it("Should throw error if could not fetch keys", async () => {
            try {
                
                deps.fetch = sinon.fake.resolves({json: () => ({keys}), ok: false})
                parseToken = authUtils.ParseToken(deps)

                await parseToken(token)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FAILED_TO_FETCH_KEYS")
            }

            try {
                
                deps.fetch = sinon.fake.rejects()
                parseToken = authUtils.ParseToken(deps)

                await parseToken(token)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("FETCH_COULD_NOT_CONNECT")
            }
        })

        it("Should call jose.JWT.createVerify() method and pass correct arg", async () => {
            const testResult = "TEST_RESULT"
            asKeyStub.resolves(testResult)
            await parseToken(token)
            expect(createVerifyStub.calledOnce).to.be.true
            expect(createVerifyStub.getCall(0).args[0]).to.equal(testResult)
        })

        it("Should call verify method and pass token", async () => {
            await parseToken(token)
            expect(verifyStub.calledOnce).to.be.true
            expect(verifyStub.getCall(0).args[0]).to.equal(token)
        })

        it("Should throw error if keys was not found", async () => {
            keys = []
            try {
                await parseToken(token)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("PUBLIC_KEY_NOT_FOUND")
            }
        })

        it("Should throw error if token was not issued for target audience", async () => {
            try {
                mockClaims.aud = "false_client_id"

                verifyStub = sinon.fake.resolves({payload: JSON.stringify(mockClaims)})
                createVerifyStub.returns({verify: verifyStub})

                await parseToken(token)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("NOT_ISSUED_FOR_TARGET_AUDIENCE")
            }
        })

        it("Should throw error if token was expired", async () => {
            try {
                mockClaims.exp = Math.floor((new Date() - 1000) / 1000);

                verifyStub = sinon.fake.resolves({payload: JSON.stringify(mockClaims)})
                createVerifyStub.returns({verify: verifyStub})

                await parseToken(token)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("TOKEN_EXPIRED")
            }
        })

        it("Should throw error if signature verification fails", async () => {
            try {
                verifyStub = sinon.fake.rejects()
                createVerifyStub.returns({verify: verifyStub})

                await parseToken(token)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("SIGNATURE_VERIFICATION_FAILED")
            }
        })

        it("Should return claims", async () => {
            const result = await parseToken(token)
            expect(result).to.deep.equal(mockClaims)
        })
    })

    describe("convertSubToUid", function() {
        it("Should throw error if sub is invalid", () => {
            try {
                authUtils.convertSubToUid(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("SUB_IS_INVALID")
            }

            try {
                authUtils.convertSubToUid("skfj")
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(err.message).to.equal("SUB_IS_INVALID")
            }
        })

        it("Should return first 12 characters of sub", () => {
            const sub = "qwertyuiopasdfg"
            const uid = authUtils.convertSubToUid(sub)
            expect(uid.length).to.equal(12)
        })
    })
})