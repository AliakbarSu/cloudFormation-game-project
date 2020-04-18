
const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")
const failedToParseTokenError = () => new Error("FAILED_TO_PARSE_TOKEN")
const failedToProcessAcceptRequestError = () => new Error("FAILED_TO_PROCESS_ACCEPT_REQUEST")
const failedToProcessRejectRequestError = () => new Error("FAILED_TO_PROCESS_REJECT_REQUEST")
const invalidUrlError = () => new Error("INVALID_URL_PROVIDED")
const invalidQueueUrlError = () => new Error("INVALID_QUEUE_URL_PROVIDED")
const invalidPidError = () => new Error("INVALID_PID_PROVIDED")
const invalidSubError = () => new Error("INVALID_SUB_PROVIDED")
const invalidTableNameError = () => new Error("INVALID_TABLE_NAME_PROVIDED")
const invalidRequestIdError = () => new Error("INVALID_REQUEST_ID_PROVIDED")
const invalidGameIdError = () => new Error("INVALID_GAME_ID_PROVIDED")
const invalidQuestionIdError = () => new Error("INVALID_QUESTION_ID_PROVIDED")
const invalidUsernameError = () => new Error("INVALID_USERNAME_PROVIDED")
const invalidPasswordError = () => new Error("INVALID_PASSWORD_PROVIDED")
const invalidUserPoolError = () => new Error("INVALID_USER_POOL_PROVIDED")
const invalidConnectionIdError = () => new Error("INVALID_CONNECTION_ID_PROVIDED")
const invalidPlayerIdsError = () => new Error("PLAYER_IDS_ARRAY_CONTAINS_INVALID_ID")
const invalidEmail = () => new Error("INVALID_EMAIL_PROVIDED")
const invalidLatitudeError = () => new Error("INVALID_LATITUDE_PROVIDED")
const invalidLongitudeError = () => new Error("INVALID_LONGITUDE_PROVIDED")
const invalidLanguageError = () => new Error("INVALID_LANGUAGE_PROVIDED")
const invalidCategoryError = () => new Error("INVALID_CATEGORY_PROVIDED")
const invalidLevelError = () => new Error("INVALID_LEVEL_PROVIDED")
const invalidNumberError = () => new Error("INVALID_NUMBER_PROVIDED")

module.exports = {
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
}