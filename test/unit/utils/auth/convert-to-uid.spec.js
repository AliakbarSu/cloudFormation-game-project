const { convertSubToUid } = require('../../../../src/opt/nodejs/utils/auth/convert-to-uid')

const chai = require('chai')
const expect = chai.expect
const sinon = require("sinon")
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe("Utils:Auth:convert-to-uid", function() {
    let mockSub

    this.beforeEach(() => {
        mockSub = "1-2-3-4-5-7-8-9-10-11-12-13"
    })

    it("Should reject if invalid sub is passed", (done) => {
        mockSub = ""
        expect(convertSubToUid(mockSub)).to.be.rejected.notify(done)
    })

    it("Should resolve to a valid uid", (done) => {
        const expectedUid = "1-2-3-4-5-7-"
        expect(convertSubToUid(mockSub)).to.become(expectedUid).notify(done)
    })
})