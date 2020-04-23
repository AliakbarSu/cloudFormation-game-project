let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get } = require("lodash/fp")
const { createPlayer } = require(layerPath + "models/players.model")
const { convertSubToUid } = require(layerPath + 'utils/auth/convert-to-uid')
const {
    isValidSub,
    isValidEmail
} = require(layerPath + "utils/validators/index")
const {
    invalidSubError,
    invalidEmail
} = require(layerPath + "utils/errors/general")



const handlerSafe = curry(async (createPlayer, event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    const userAttributes = event.request.userAttributes

    const sub = get("sub", userAttributes)
    const email = get("email", userAttributes)
    
    if(!isValidSub(sub))
        return Promise.reject(invalidSubError())

    if(!isValidEmail(email))
        return Promise.reject(invalidEmail())

    const updatedSub = await convertSubToUid(sub).catch(err => {
        console.log("FAILED_TO_CONVERT_SUB_TO_UID")
        return Promise.reject(err)
    })

    return createPlayer(updatedSub, email)
    .then(() => event)
    .catch(err => {
        console.log(err)
        console.log("Failed initalizing player. Take action immediately")
        return Promise.reject(err)
    })
})


module.exports = {
    handlerSafe,
    handler: handlerSafe(createPlayer(process.env.MONGO_DB_URI))
}



