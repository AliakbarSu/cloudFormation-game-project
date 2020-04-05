exports.removeUnrelatedProperties = (event) => {
    const config = {...event}
    delete config.RequestType
    delete config.RequestId
    delete config.ResponseURL
    delete config.ResourceType
    delete config.LogicalResourceId
    delete config.PhysicalResourceId
    // Review delete config.groupId
    delete config.groupId
    delete config.appId
    delete config.StackId
    delete config.ResourceProperties
    return config
}