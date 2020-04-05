const { removeUnrelatedProperties } = require('../../../src/opt/nodejs/utils/removeUnrelatedProperties')
var chai = require('chai');
const expect = chai.expect

describe("removeUnrelatedProperties", function() {
    let event = {
        PhysicalResourceId: "test_cluster",
        groupId: "test_group",
        name: "test_cluster",
        providerName: "test_provider"
    }
    it("Should remove stack related properties from event object", async () => {
        event.StackId = "test_stack_id"
        const result = removeUnrelatedProperties(event)
        expect(result.StackId).to.be.undefined
    })

    it("Should not modify the original object", async () => {
        event.StackId = "test_stack_id"
        const result = removeUnrelatedProperties(event)
        expect(result.StackId).to.be.undefined
        expect(event.StackId).not.to.be.undefined
    })
})