const { curry } = require('lodash/fp')

exports.generatePolicy = curry((principalId, effect, resource, userEmail) => {
    const authResponse = {}
    authResponse.context = {}
    authResponse.context.userEmail = userEmail
    authResponse.principalId = principalId
    if (effect && resource) {
        const policyDocument = {}
        // default version
        policyDocument.Version = "2012-10-17"
        policyDocument.Statement = []
        const statementOne = {}
        // default action
        statementOne.Action = "execute-api:Invoke"
        statementOne.Effect = effect
        statementOne.Resource = resource
        policyDocument.Statement[0] = statementOne
        authResponse.policyDocument = policyDocument
    }
    return authResponse
})
