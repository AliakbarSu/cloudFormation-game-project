const axios = require('axios')
   
exports.authenticate = async (apiKey, secretKey) => {
    if(!apiKey || !secretKey) {
        return Promise.reject(new Error("INVALID_CREDENTIALS"))
    }
    const url = "https://stitch.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login"
    const params = {
        username: apiKey,
        apiKey: secretKey
    }
    const result = await axios.default.post(url, params)
    return result.data.access_token
}