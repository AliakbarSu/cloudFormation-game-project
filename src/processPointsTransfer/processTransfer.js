let layerPath = process.env['DEV'] ? "../opt/nodejs/" : "/opt/nodejs/"

const { curry, get} = require("lodash/fp")
const { isValidAmount, isValidPid, isValidCode } = require(layerPath + 'utils/validators/index')
const { invalidAmountError, invalidPidError, invalidCodeError } = require(layerPath + 'utils/errors/general')


const failedToProcessTransferError = () => new Error("FAILED_TO_PROCESS_TRANSFER")


const processTransferSafe = curry(async (transferPoints, data) => {
    
    const code = get("code", data)
    const amount = get("amount", data)
    const playerId = get("playerId", data)

    if(!isValidCode(code))
        return Promise.reject(invalidCodeError())

    if(!isValidAmount(amount))
        return Promise.reject(invalidAmountError())

    if(!isValidPid(playerId))
        return Promise.reject(invalidPidError())
    
    try {
        await transferPoints(code, playerId, amount)
        return Promise.resolve("POINTS_TRANSFERED_SUCCESSFULLY")
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToProcessTransferError())
    }
})


module.exports = {
    failedToProcessTransferError,
    processTransferSafe,
    processTransfer: processTransferSafe(() => Promise.resolve())
}

