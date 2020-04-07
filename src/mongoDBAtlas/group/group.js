let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AxiosDigest = require('axios-digest').AxiosDigest
const axiosDigest = new AxiosDigest(process.env.API_KEY, process.env.SECRET_KEY)
const { removeUnrelatedProperties } = require(resourcesPath + 'utils/removeUnrelatedProperties')

exports.createGroup = (event) => {
    console.log("Creating group.")
    if(!event || !event.orgId || !event.name) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    const url = "https://cloud.mongodb.com/api/atlas/v1.0/groups"
    const params = removeUnrelatedProperties(event)
    return axiosDigest.post(url, params).then(res => res.data)
}



exports.deleteGroup = async (event) => {
    console.log("Deleting group.")
    if(!event || !event.PhysicalResourceId || event.PhysicalResourceId.length == 0) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    const groupId = event.PhysicalResourceId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}`
    console.log(url)
    await axiosDigest.delete(url)
    return null
}