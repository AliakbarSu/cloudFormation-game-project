let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AxiosDigest = require('axios-digest').AxiosDigest
const axiosDigest = new AxiosDigest(process.env.API_KEY, process.env.SECRET_KEY)
const { removeUnrelatedProperties } = require(resourcesPath + 'utils/removeUnrelatedProperties')

exports.createGroup = (event) => {
    if(!event || !event.orgId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    const url = "https://cloud.mongodb.com/api/atlas/v1.0/groups"
    const params = removeUnrelatedProperties(event)
    return axiosDigest.post(url, params).then(res => res.data)
}

exports.updateGroup = (event) => {
    if(!event || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    const groupId = event.PhysicalResourceId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}`
    const params = removeUnrelatedProperties(event)
    return axiosDigest.patch(url, params).then(res => res.data)
}

exports.deleteGroup = (event) => {
    if(!event || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    const groupId = event.PhysicalResourceId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}`
    return axiosDigest.delete(url).then(res => res.data)
}