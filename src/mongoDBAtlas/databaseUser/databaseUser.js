let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AxiosDigest = require('axios-digest').AxiosDigest
const axiosDigest = new AxiosDigest(process.env.API_KEY, process.env.SECRET_KEY)
const { removeUnrelatedProperties } = require(resourcesPath + 'utils/removeUnrelatedProperties')
   

exports.createDatabaseUser = async (event) => {
    console.log("Creating database user.")
    if(!event || !event.groupId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/databaseUsers`
    
    const params = removeUnrelatedProperties(event)
    console.log(params)
    return axiosDigest.post(url, params).then(res => ({...res.data, password: params.password}))
}

exports.updateDatabaseUser = async (event) => {
    console.log("Updating database user.")
    if(!event || !event.groupId || !event.PhysicalResourceId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const username = event.PhysicalResourceId
    const databaseName = event.databaseName
    let url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/databaseUsers/${databaseName}/${username}`
    
    const params = removeUnrelatedProperties(event)
    if(username !== event.username) {
        url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/databaseUsers`
        return axiosDigest.post(url, params).then(res => ({...res.data, password: params.password}))
    }
    delete params.username
    return axiosDigest.patch(url, params).then(res => ({...res.data, password: params.password}))
}

exports.deleteDatabaseUser = async (event) => {
    console.log("Deleting database user.")
    if(!event || !event.groupId || !event.PhysicalResourceId || !event.databaseName) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const username = event.PhysicalResourceId
    const databaseName = event.databaseName
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/databaseUsers/${databaseName}/${username}`
    
    await axiosDigest.delete(url)
    return null
}