let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}


const AxiosDigest = require('axios-digest').AxiosDigest
const axiosDigest = new AxiosDigest(process.env.API_KEY, process.env.SECRET_KEY)
const { removeUnrelatedProperties } = require(resourcesPath + 'utils/removeUnrelatedProperties')


exports.fetchCluster = (event) => {
  if(!event || !event.groupId || !event.name) {
    return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
  }
  const groupId = event.groupId
  const clusterName = event.name
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters/${clusterName}`
  return axiosDigest.get(url).then(res => res.data)
}


exports.createCluster = (event) => {
    if(!event || !event.groupId) {
      return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    const groupId = event.groupId
    const config = removeUnrelatedProperties(event)
    console.log(config)
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters`
    return axiosDigest.post(url, config).then(res => res.data)
}

exports.updateCluster = (event) => {
  if(!event || !event.groupId || !event.PhysicalResourceId) {
    return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
  }
  const clusterName = event.PhysicalResourceId
  const groupId = event.groupId
  const config = removeUnrelatedProperties(event)
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters/${clusterName}`
  return axiosDigest.patch(url, config).then(res => res.data)
}

exports.deleteCluster = (event) => {
  if(!event || !event.groupId || !event.PhysicalResourceId) {
    return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
  }
  const clusterName = event.PhysicalResourceId
  const groupId = event.groupId
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters/${clusterName}`
  return axiosDigest.delete(url).then(res => res.data)
}


