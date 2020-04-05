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

exports.createEventTrigger = async (event) => {
    if(!event || !event.appId || !event.groupId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    
    const groupId = event.groupId
    const appId = event.appId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    const result = await axios.default.post(url, params, {headers})
    return {EventSourceName: "aws.partner/mongodb.com/stitch.trigger/" + result.data._id}
}


exports.updateEventTrigger = async (event) => {
    if(!event || !event.appId || !event.groupId || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
  
    const groupId = event.groupId
    const appId = event.appId
    const triggerId = event.PhysicalResourceId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers/${triggerId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    const result = await axios.default.patch(url, params, {headers})
    return {EventSourceName: "aws.partner/mongodb.com/stitch.trigger/" + result.data._id}
}

exports.deleteEventTrigger = async (event) => {
    if(!event || !event.appId || !event.groupId || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
  
    const groupId = event.groupId
    const appId = event.appId
    const triggerId = event.PhysicalResourceId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers/${triggerId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const result = await axios.default.delete(url, {headers})
    return {EventSourceName: "aws.partner/mongodb.com/stitch.trigger/" + result.data._id}
}