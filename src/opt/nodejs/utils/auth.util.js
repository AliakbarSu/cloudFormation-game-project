
const fetch = require('node-fetch');
const jose = require('node-jose');
const CONSTANTS = require('../constants');

const tokenParser = deps => (token) => {
    return new Promise( async (resolve, reject) => {
        if (!token) {
            return reject(new Error("TOKEN_IS_NULL"))
        }
        // Get the kid from the headers prior to verification
        const sections = token.split('.');
        let header = deps.jose.util.base64url.decode(sections[0]);
        header = JSON.parse(header);
        const kid = header.kid;

        // Fetch known valid keys
        try {
            const rawRes = await deps.fetch(deps.CONSTANTS.KEYS_URL);
            const response = await rawRes.json();
            if (rawRes.ok) {
                const keys = response['keys'];
                const foundKey = keys.find((key) => key.kid === kid);
    
                if (!foundKey) {
                    return reject(new Error("PUBLIC_KEY_NOT_FOUND"));
                } else {
                    try {
                        const result = await deps.jose.JWK.asKey(foundKey);
                        const keyVerify = deps.jose.JWS.createVerify(result);
                        const verificationResult = await keyVerify.verify(token);
    
                        const claims = JSON.parse(verificationResult.payload);
                        // Verify the token expiration
                        const currentTime = Math.floor(new Date() / 1000);
                        if (currentTime > claims.exp) {
                            return reject(new Error("TOKEN_EXPIRED"));
                        } else if (claims.aud !== deps.CONSTANTS.COGNITO_USER_POOL_CLIENT) {
                            return reject(new Error("NOT_ISSUED_FOR_TARGET_AUDIENCE"));
                        } else {
                            return resolve(claims);
                        }
                    } catch (error) {
                        reject(new Error("SIGNATURE_VERIFICATION_FAILED"));
                    }
                }
            }else {
                reject(new Error("FAILED_TO_FETCH_KEYS"))
            }
    
        }catch(err) {
            reject(new Error("FETCH_COULD_NOT_CONNECT"))
        }
    })
    
}

exports.parseToken = tokenParser({
    fetch,
    jose,
    CONSTANTS
})

exports.ParseToken = tokenParser

exports.convertSubToUid = (sub) => {
    if(!sub || sub.length < 12) {
        throw new Error("SUB_IS_INVALID")
    }
    return sub.substr(0, 12);
}
