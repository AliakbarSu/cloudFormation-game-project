let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}

const axios = require('axios')
const SA = require(resourcesPath + "utils/stitch-authenticate")
const UTIL = require(resourcesPath + 'utils/removeUnrelatedProperties')
   

const headers = {
    'Content-Type': "application/json",
    "Authorization": 'Bearer '
}

exports.createStitchApp = async (event) => {
    if(!event || !event.groupId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    
    const groupId = event.groupId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps`
    const params = UTIL.removeUnrelatedProperties(event)

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    return axios.default.post(url, params, {headers}).then(res => res.data)
}

exports.updateStitchApp = async (event) => {
    if(!event || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    
    const appId = event.PhysicalResourceId
    const groupId = event.groupId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}`
    const params = UTIL.removeUnrelatedProperties(event)

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken
    
    return axios.default.patch(url, params, {headers}).then(res => res.data)
}

exports.deleteStitchApp = async (event) => {
    if(!event || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    
    const appId = event.PhysicalResourceId
    const groupId = event.groupId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken
    
    return axios.default.delete(url, {headers}).then(res => res.data)
}