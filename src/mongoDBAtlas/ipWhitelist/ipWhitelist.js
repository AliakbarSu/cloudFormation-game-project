let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AxiosDigest = require('axios-digest').AxiosDigest
const axiosDigest = new AxiosDigest(process.env.API_KEY, process.env.SECRET_KEY)
const { removeUnrelatedProperties } = require(resourcesPath + 'utils/removeUnrelatedProperties')
    

exports.createIp = async (event) => {
    console.log("Adding IP address to the whitelist.")
    if(!event || !event.groupId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/whitelist`
    
    const params = removeUnrelatedProperties(event)
    const ipAddress = event.ipAddress
    await axiosDigest.post(url, [params])
    return {ipAddress: ipAddress}
}


exports.deleteIp = async (event) => {
    console.log("Removing IP address from the whitelist.")
    if(!event || !event.groupId || !event.PhysicalResourceId) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const groupId = event.groupId
    const ipAddress = event.PhysicalResourceId
    const cidrBlock = ipAddress.split("/")
    const newCidrBlock = cidrBlock[0] + "%2F" + cidrBlock[1]
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/whitelist/${newCidrBlock}`
    
    await axiosDigest.delete(url)
    return {ipAddress: event.ipAddress}
}