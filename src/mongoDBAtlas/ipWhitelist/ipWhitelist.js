let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AxiosDigest = require('axios-digest').AxiosDigest
const axiosDigest = new AxiosDigest(process.env.API_KEY, process.env.SECRET_KEY)
const { removeUnrelatedProperties } = require(resourcesPath + 'utils/removeUnrelatedProperties')
    

exports.createIp = async (event) => {
    if(!event || !event.groupId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/whitelist`
    
    const params = removeUnrelatedProperties(event)
    return axiosDigest.post(url, [params]).then(res => res.data.results[0])
}

exports.updateIp = async (event) => {
    if(!event || !event.groupId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/whitelist`
    
    const params = removeUnrelatedProperties(event)
    return axiosDigest.post(url, [params]).then(res => res.data.results[0])
}

exports.deleteIp = (event) => {
    if(!event || !event.groupId || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const ipAddress = event.PhysicalResourceId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/whitelist/${ipAddress}`
    
    return axiosDigest.delete(url).then(res => res.data.results[0])
}