const { _parseToken, findKey } = require('../../../../src/opt/nodejs/utils/auth/index')

const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)



describe("Utils:Auth:index", function() {
    let kid
    const keys = [{kid: "test1", kid: "test2"}]

    describe("findKey", function() {
        it("Should resolve a kid", (done) => {
            kid = keys[0].kid
            expect(findKey(keys, kid)).to.become(keys[0]).notify(done)
        })

        it("Should reject if key is not in the keys array", (done) => {
            kid = "unknown-kid"
            expect(findKey(keys, kid)).to.rejected.notify(done)
        })
    })

    describe("_parseToken", function() {
        let mockToken, mockKeysUrl, mockClaims,
        extracKidStub, fetchKeysStub, getClaimsStub,
        validateExpiryStub

    
        this.beforeEach(() => {
            mockToken = "jfksjfksjfsfjksjfkjsf"
            mockKeysUrl = "https://test.com"
            mockClaims = {exp: 'test_exp', aud: "test_aud"}
            extracKidStub = fake.resolves(keys[0].kid)
            fetchKeysStub = fake.resolves(keys)
            getClaimsStub = fake.resolves(mockClaims)
            validateExpiryStub = fake.resolves()
        })


        it("Should reject if token is invalid", (done) => {
            expect(_parseToken(
                extracKidStub, 
                getClaimsStub, 
                fetchKeysStub, 
                validateExpiryStub, 
                mockKeysUrl, "")).to.be.rejected.notify(done)
        })

        it("Should reject if keysUrl is invalid", (done) => {
            expect(_parseToken(
                extracKidStub, 
                getClaimsStub, 
                fetchKeysStub, 
                validateExpiryStub, 
                "", mockToken)).to.be.rejected.notify(done)
        })

        it("Should resolve to claims if everything went well", (done) => {
            expect(_parseToken(
                extracKidStub, 
                getClaimsStub, 
                fetchKeysStub, 
                validateExpiryStub, 
                mockKeysUrl, mockToken)).to.become(mockClaims).notify(done)
        })

        it("Should reject if extracKid rejects", (done) => {
            extracKidStub = fake.rejects()
            expect(_parseToken(
                extracKidStub, 
                getClaimsStub, 
                fetchKeysStub, 
                validateExpiryStub, 
                mockKeysUrl, mockToken)).to.be.rejected.notify(done)
        })

        it("Should reject if getClaims rejects", (done) => {
            getClaimsStub = fake.rejects()
            expect(_parseToken(
                extracKidStub, 
                getClaimsStub, 
                fetchKeysStub, 
                validateExpiryStub, 
                mockKeysUrl, mockToken)).to.be.rejected.notify(done)
        })

        it("Should reject if fetchKeys rejects", (done) => {
            fetchKeysStub = fake.rejects()
            expect(_parseToken(
                extracKidStub, 
                getClaimsStub, 
                fetchKeysStub, 
                validateExpiryStub, 
                mockKeysUrl, mockToken)).to.be.rejected.notify(done)
        })

        it("Should reject if validateExpiry rejects", (done) => {
            validateExpiryStub = fake.rejects()
            expect(_parseToken(
                extracKidStub, 
                getClaimsStub, 
                fetchKeysStub, 
                validateExpiryStub, 
                mockKeysUrl, mockToken)).to.be.rejected.notify(done)
        })


    })
})