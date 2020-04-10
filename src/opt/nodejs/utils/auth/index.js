const KID = require('./kid-extractor')
const KEYS = require('./keys')
const CLAIMS = require('./claims')
const TOKEN_VALIDATOR = require('./token-validator')



exports.ParseToken = async (token) => {
    if(!token) {
        return Promise.reject(new Error("INVALID_TOKEN_PROVIDED"))
    }

    const kid = KID.extractKid(token)
    const keys = await KEYS.fetchKeys(process.env.KEYS_URL).catch(err => {
        console.log("FAILED_TO_FETCH_KEYS: ", err)
        throw err
    })

    const foundKey = keys.find((key) => key.kid === kid);

    if (!foundKey) {
        throw new Error("PUBLIC_KEY_NOT_FOUND")
    }
    
    const claims = await CLAIMS.getClaims(foundKey)

    const isValid = await TOKEN_VALIDATOR.validate(claims.exp, claims.aud)

    if(!isValid) {
        throw new Error("TOKEN_IS_NOT_VALID")    
    }

    resolve(claims)
}