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
    console.log("Creating service.")
    if(!event || !event.groupId || !event.appId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const appId = event.appId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/services`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    return axios.default.post(url, params, {headers}).then(res => res.data)
}

exports.updateService = async (event) => {
    console.log("Updating service.")
    if(!event || !event.groupId || !event.appId || !event.PhysicalResourceId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const appId = event.appId
    const serviceId = event.PhysicalResourceId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/services/${serviceId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    params.version = 1
    return axios.default.patch(url, params, {headers}).then(res => res.data)
}


exports.deleteService = async (event) => {
    console.log("Deleting service.")
    if(!event || !event.groupId || !event.appId || !event.PhysicalResourceId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const appId = event.appId
    const serviceId = event.PhysicalResourceId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/services/${serviceId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const service = await axios.default.get(url, {headers}).then(res => res.data)
    await axios.default.delete(url, {headers})
    return service
}