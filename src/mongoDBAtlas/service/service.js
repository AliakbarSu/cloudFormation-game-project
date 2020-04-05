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
   

exports.createService = async (event) => {
    if(!event || !event.groupId || !event.appId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const appId = event.appId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/services`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    console.log(params)
    return axios.default.post(url, params, {headers}).then(res => res.data)
}

exports.updateService = async (event) => {
    if(!event || !event.groupId || !event.appId || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const appId = event.appId
    const serviceId = event.PhysicalResourceId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/services/${serviceId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    return axios.default.patch(url, params, {headers}).then(res => res.data)
}


exports.deleteService = async (event) => {
    if(!event || !event.groupId || !event.appId || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const appId = event.appId
    const serviceId = event.PhysicalResourceId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/services/${serviceId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    return axios.default.delete(url, {headers}).then(res => res.data)
}