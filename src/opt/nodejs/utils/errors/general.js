
const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")
const failedToParseTokenError = () => new Error("FAILED_TO_PARSE_TOKEN")
const failedToProcessAcceptRequestError = () => new Error("FAILED_TO_PROCESS_ACCEPT_REQUEST")
const failedToProcessRejectRequestError = () => new Error("FAILED_TO_PROCESS_REJECT_REQUEST")
const invalidUrlError = () => new Error("INVALID_URL_PROVIDED")
const invalidPidError = () => new Error("INVALID_PID_PROVIDED")
const invalidSubError = () => new Error("INVALID_SUB_PROVIDED")
const invalidTableNameError = () => new Error("INVALID_TABLE_NAME_PROVIDED")
const invalidRequestIdError = () => new Error("INVALID_REQUEST_ID_PROVIDED")
const invalidUsernameError = () => new Error("INVALID_USERNAME_PROVIDED")
const invalidPasswordError = () => new Error("INVALID_PASSWORD_PROVIDED")
const invalidUserPoolError = () => new Error("INVALID_USER_POOL_PROVIDED")

module.exports = {
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
}