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
    console.log("Creating trigger.")
    console.log(event)
    if(!event || !event.appId || !event.groupId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    if(event.config && event.config.full_document !== undefined) {
        event.config.full_document = Boolean(event.config.full_document)
    }

    
    const groupId = event.groupId
    const appId = event.appId
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    const result = await axios.default.post(url, params, {headers}).then(res => res.data).catch(err => {
        console.log(err.response.data, err)
    })
    return {
        ...result,
        EventSourceName: "aws.partner/mongodb.com/stitch.trigger/" + result._id
    }
}


exports.updateEventTrigger = async (event) => {
    console.log("Updating trigger.")
    if(!event || !event.appId || !event.groupId || !event.PhysicalResourceId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    if(event.config && event.config.full_document !== undefined) {
        event.config.full_document = Boolean(event.config.full_document)
    }
  
    const groupId = event.groupId
    const appId = event.appId
    const triggerId = event.PhysicalResourceId.split("/")[3]
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers/${triggerId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken

    const params = UTIL.removeUnrelatedProperties(event)
    const trigger = await axios.default.get(url, {headers}).then(res => res.data)
    await axios.default.put(url, params, {headers}).then(res => res.data)
    return {
        ...trigger,
        EventSourceName: "aws.partner/mongodb.com/stitch.trigger/" + triggerId
    }
}

exports.deleteEventTrigger = async (event) => {
    console.log("Deleting trigger.")
    if(!event || !event.appId || !event.groupId || !event.PhysicalResourceId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
  
    const groupId = event.groupId
    const appId = event.appId
    const triggerId = event.PhysicalResourceId.split("/")[3]
    const url = `https://stitch.mongodb.com/api/admin/v3.0/groups/${groupId}/apps/${appId}/triggers/${triggerId}`

    const authToken = await SA.authenticate(process.env.API_KEY, process.env.SECRET_KEY)
    headers.Authorization = 'Bearer ' + authToken
    const trigger = await axios.default.get(url, {headers}).then(res => res.data)
    await axios.default.delete(url, {headers})
    return {
        ...trigger,
        EventSourceName: "aws.partner/mongodb.com/stitch.trigger/" + triggerId
    }
}