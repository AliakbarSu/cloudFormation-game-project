const jose = require('node-jose');

const _getClaims = deps => async (key, token) => {
    if(!key || !token) {
        return Promise.reject(new Error("PUBLIC_KEY_OR_TOKEN_NOT_PROVIDED"))
    }
    try {
        const result = await deps.jose.JWK.asKey(key);
        const keyVerify = deps.jose.JWS.createVerify(result);
        const verificationResult = await keyVerify.verify(token);
        return JSON.parse(verificationResult.payload);
    }catch(err) {
       console.log(err)
       return Promise.reject(new Error("SIGNATURE_VERIFICATION_FAILED"))
    }
}

module.exports = {
    _getClaims,
    getClaims: _getClaims({jose})
}