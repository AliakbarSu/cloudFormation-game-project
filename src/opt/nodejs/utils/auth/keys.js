const axios = require('axios')


exports.fetchKeys = async (keys_url) => {
    if(!keys_url) {
        return Promise.reject(new Error("NO_KEYS_URL_PROVIDED"))
    }
    return axios.default.get(keys_url).then(data => data.keys)
}