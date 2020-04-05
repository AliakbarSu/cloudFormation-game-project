let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AxiosDigest = require('axios-digest').AxiosDigest
const axiosDigest = new AxiosDigest(process.env.API_KEY, process.env.SECRET_KEY)
const { removeUnrelatedProperties } = require(resourcesPath + 'utils/removeUnrelatedProperties')
   

exports.createDatabaseUser = async (event) => {
    if(!event || !event.groupId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/databaseUsers`
    
    const params = removeUnrelatedProperties(event)
    return axiosDigest.post(url, params).then(res => ({...res.data, password: params.password}))
}

exports.updateDatabaseUser = async (event) => {
    if(!event || !event.groupId || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const username = event.PhysicalResourceId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/databaseUsers/${username}`
    
    const params = removeUnrelatedProperties(event)
    delete params.username
    return axiosDigest.patch(url, params).then(res => ({...res.data, password: params.password}))
}

exports.deleteDatabaseUser = (event) => {
    if(!event || !event.groupId || !event.PhysicalResourceId) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const username = event.PhysicalResourceId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/databaseUsers/${username}`
    
    return axiosDigest.delete(url).then(res => ({...res.data, password: event.password}))
}