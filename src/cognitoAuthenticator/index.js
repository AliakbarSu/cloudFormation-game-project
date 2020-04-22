let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get } = require("lodash/fp")
const mapError = require(layerPath + 'utils/error')
const { authenticateUser } = require(layerPath + 'connectors/cognito.connector')
const { isValidPassword, isValidUsername } = require(layerPath + 'utils/validators/index')
const { invalidPasswordError, invalidUsernameError } = require(layerPath + 'utils/errors/general')

const handlerSafe = curry(async (authenticateUser, event, context) => {
    const data = event
    const username = get("username", data)
    const password = get("password", data)

    if(!isValidUsername(username))
        return Promise.reject(invalidUsernameError())

    if(!isValidPassword(password))
        return Promise.reject(invalidPasswordError())


    try {
        const result = await authenticateUser(process.env.USER_POOL_ID, username, password)
        return {
            token: result.tokenId,
            refresh: result.refreshToken,
            username
        }
    }catch(err) {
        console.log(err)
        const mapedError = mapError(err, context)
        return Promise.reject(mapedError)
    }
})


module.exports = {
    handlerSafe,
    handler: handlerSafe(authenticateUser)
}
