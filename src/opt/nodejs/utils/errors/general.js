
const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")
const failedToParseTokenError = () => new Error("FAILED_TO_PARSE_TOKEN")
const invalidUrlError = () => new Error("INVALID_URL_PROVIDED")

module.exports = {
    invalidTokenError,
    failedToParseTokenError,
    invalidUrlError
}