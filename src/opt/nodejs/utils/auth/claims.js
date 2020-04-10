

exports.getClaims = async (key) => {
    if(!key) {
        return Promise.reject(new Error("PUBLIC_KEY_NOT_PROVIDED"))
    }
    try {
        const result = await deps.jose.JWK.asKey(key);
        const keyVerify = deps.jose.JWS.createVerify(result);
        const verificationResult = await keyVerify.verify(token);
        return JSON.parse(verificationResult.payload);
    }catch(err) {
       return Promise.reject(new Error("SIGNATURE_VERIFICATION_FAILED"))
    }
}