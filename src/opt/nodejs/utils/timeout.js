const SR = require('./sendResponse')


exports.timeout = async (event, context, timeoutValue) => {
    await new Promise((resolve) => {
        setTimeout(async () => {
            await SR.sendResponse(event, context, "FAILED", {}).catch(err => err)
            console.log(`Function timedout after ${timeoutValue} milliseconds. Function failed to send response to S3`)
            resolve()
        }, timeoutValue)
    })
}