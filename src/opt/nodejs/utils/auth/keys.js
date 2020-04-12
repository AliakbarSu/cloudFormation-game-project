const { curry } = require("lodash/fp")
const axios = require('axios')
const { isValidUrl } = require('../validators/index')


const invalidUrlError = () => new Error("INVALID_URL_PROVIDED")

const failedToFetchKeysError = () => new Error("FAILED_TO_FETCH_KEYS")

const fetchKeysSafe = curry((api, url) => {
    return api(url)
    .catch(() => Promise.reject(failedToFetchKeysError()))
    
})


const _fetchKeys = curry((urlValidator, api, url) => {
    if(urlValidator(url)) 
        return fetchKeysSafe(api, url)
    else
        return Promise.reject(invalidUrlError())
})



module.exports = {
    invalidUrlError,
    failedToFetchKeysError,
    fetchKeysSafe,
    _fetchKeys,
    fetchKeys: _fetchKeys(isValidUrl, axios.default.get)
}