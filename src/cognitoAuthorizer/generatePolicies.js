// Bootstraps the application
require('./generatePolicy')
function _generateAllow(generatePolicy) {
    return (principalId, resource, userEmail) => {
        return generatePolicy(principalId, "Allow", resource, userEmail);
    }
} 

function _generateDeny (generatePolicy) {
    return (principalId, resource) => {
        return generatePolicy(principalId, "Deny", resource);
    }
}


const bottle = require("bottlejs").pop("click")
bottle.service("generateAllow", _generateAllow, "generatePolicy")
bottle.service("generateDeny", _generateDeny, "generatePolicy")

module.exports = {
    generateAllow: _generateAllow,
    generateDeny: _generateDeny
}

