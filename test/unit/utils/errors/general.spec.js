const {
    invalidNumberError,
    invalidLanguageError,
    invalidCategoryError,
    invalidLevelError,
    invalidLatitudeError,
    invalidLongitudeError,
    invalidEmail,
    invalidPlayerIdsError,
    invalidQuestionIdError,
    invalidQueueUrlError,
    invalidGameIdError,
    invalidConnectionIdError,
    invalidUserPoolError,
    invalidUsernameError,
    invalidPasswordError,
    invalidTableNameError,
    failedToProcessAcceptRequestError,
    failedToProcessRejectRequestError,
    invalidRequestIdError,
    invalidSubError,
    invalidPidError,
    invalidTokenError,
    failedToParseTokenError,
    invalidUrlError
} = require('../../../../src/opt/nodejs/utils/errors/general')

const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe("Utils::errors::general", function() {
    it("Should return the correct text message", () => {
        expect(invalidNumberError().message).to.equal("INVALID_NUMBER_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidTokenError().message).to.equal("INVALID_TOKEN_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(failedToParseTokenError().message).to.equal("FAILED_TO_PARSE_TOKEN")
    })

    it("Should return the correct text message", () => {
        expect(failedToProcessAcceptRequestError().message).to.equal("FAILED_TO_PROCESS_ACCEPT_REQUEST")
    })

    it("Should return the correct text message", () => {
        expect(failedToProcessRejectRequestError().message).to.equal("FAILED_TO_PROCESS_REJECT_REQUEST")
    })

    it("Should return the correct text message", () => {
        expect(invalidUrlError().message).to.equal("INVALID_URL_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidQueueUrlError().message).to.equal("INVALID_QUEUE_URL_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidPidError().message).to.equal("INVALID_PID_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidSubError().message).to.equal("INVALID_SUB_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidTableNameError().message).to.equal("INVALID_TABLE_NAME_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidRequestIdError().message).to.equal("INVALID_REQUEST_ID_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidGameIdError().message).to.equal("INVALID_GAME_ID_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidQuestionIdError().message).to.equal("INVALID_QUESTION_ID_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidUsernameError().message).to.equal("INVALID_USERNAME_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidPasswordError().message).to.equal("INVALID_PASSWORD_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidUserPoolError().message).to.equal("INVALID_USER_POOL_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidConnectionIdError().message).to.equal("INVALID_CONNECTION_ID_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidPlayerIdsError().message).to.equal("PLAYER_IDS_ARRAY_CONTAINS_INVALID_ID")
    })

    it("Should return the correct text message", () => {
        expect(invalidEmail().message).to.equal("INVALID_EMAIL_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidLatitudeError().message).to.equal("INVALID_LATITUDE_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidLongitudeError().message).to.equal("INVALID_LONGITUDE_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidLanguageError().message).to.equal("INVALID_LANGUAGE_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidCategoryError().message).to.equal("INVALID_CATEGORY_PROVIDED")
    })

    it("Should return the correct text message", () => {
        expect(invalidLevelError().message).to.equal("INVALID_LEVEL_PROVIDED")
    })
})