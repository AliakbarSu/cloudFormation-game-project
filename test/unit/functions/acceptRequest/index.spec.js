const chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const Bottle = require('bottlejs')
const _handler = require('../../../../src/acceptRequest/index').handler


describe("acceptRequest::index", function() {
    let event, context, acceptRequestStub, parseTokenStub,
    convertToSubStub, bottle

    const mockClaims = {
        sub: "test_sub",
        email: "test_email"
    }

    const mockPid = "test_pid"
    
    
    this.beforeEach(() => {
        Bottle.clear("click")
        bottle = Bottle.pop("click")
           
        bottle.service('model.request', function () {
            acceptRequestStub = sinon.fake.resolves()
            return {
                acceptRequest: acceptRequestStub
            }
        })

        bottle.service("utils.parseToken", function () {
            parseTokenStub = sinon.fake.resolves(mockClaims)
            return parseTokenStub
        })
        bottle.service("utils.convertSubToUid", function () {
            convertToSubStub = sinon.fake.returns(mockPid)
            return convertToSubStub
        })

        event = {
            token: "test_token",
            requestId: 'test_request_id'
        }

        context = {
            callbackWaitsForEmptyEventLoop: true
        }
    })

    this.afterAll(() => {
    })

    it("Should register acceptRequest as a service in the container", async () => {
        expect(bottle.container.acceptRequest).to.be.undefined
        await _handler(event, context)
        expect(bottle.container.acceptRequest).not.to.be.undefined
    })

    it("Should throw error if token is missing", async () => {
        try {
            event.token = null
            await _handler(event, context)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(err.message).to.equal("INVALID_PARAMETERS_PROVIDED")
        }
    })

    it("Should throw error if requestId is missing", async () => {
        try {
            event.requestId = null
            await _handler(event, context)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(err.message).to.equal("INVALID_PARAMETERS_PROVIDED")
        }
    })

    it("Should set context.callbackWaitsForEmptyEventLoop to false", async () => {
        await _handler(event, context)
        expect(context.callbackWaitsForEmptyEventLoop).to.be.false
    })

    it("Should invoke parseToken and pass the token", async () => {
        await _handler(event, context)
        console.log(parseTokenStub.callCount)
        expect(parseTokenStub.calledOnce).to.be.true
        expect(parseTokenStub.getCall(0).args[0]).to.equal(event.token)
    })

    it("Should invoke convertSubToPid and sub", async () => {
        await _handler(event, context)
        expect(convertToSubStub.calledOnce).to.be.true
        expect(convertToSubStub.getCall(0).args[0]).to.equal(mockClaims.sub)
    })

    it("Should invoke playersModel.acceptRequest and pass correct args", async () => {
        await _handler(event, context)
        expect(acceptRequestStub.calledOnce).to.be.true
        expect(acceptRequestStub.getCall(0).args[0]).to.equal(event.requestId)
        expect(acceptRequestStub.getCall(0).args[1]).to.equal(mockPid)
    })

    it("Should throw error when could not process request", async () => {
        bottle.service('model.request', function () {
            acceptRequestStub = sinon.fake.rejects()
            return {
                acceptRequest: acceptRequestStub
            }
        })
        try {
            await _handler(event, context)
            throw new Error("FALSE_PASS")
        }catch(err) {
            expect(err.message).to.equal("FAILED_TO_PROCESS_REQUEST")
        }
    })
})