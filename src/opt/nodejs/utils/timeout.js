const SR = require('./sendResponse')


exports.timeout = async (event, context, timeoutValue) => {
    await new Promise((resolve) => {
        setTimeout(async () => {
            console.log(`Function is about to time out after running for ${timeoutValue} milliseconds therefore, sends response to S3`)
            await SR.sendResponse(event, context, "FAILED", {}).catch(err => err)
            resolve()
        }, timeoutValue)
    })
}