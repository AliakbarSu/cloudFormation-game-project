const axios = require('axios')


// Send response to the pre-signed S3 URL 
exports.sendResponse = async (event, context, responseStatus, responseData) => {

    if(!event || !context || !responseStatus) {
        console.log(event, context, responseStatus, responseData)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    let retries = 3
    let count = 0
    let sent = false
    let error = null

    while(count < retries && sent == false) {
        try {
            var responseBody = {
                Status: responseStatus,
                Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
                PhysicalResourceId: event.PhysicalResourceId || "NO_RESOURCE_CREATED",
                StackId: event.StackId,
                RequestId: event.RequestId,
                LogicalResourceId: event.LogicalResourceId,
                Data: {...responseData, placeholder: "Value"}
            };

            
            count++
            const headers = {
                "content-type": "",
                "content-length": JSON.stringify(responseBody).length
            }
            await axios.default.put(event.ResponseURL, responseBody, {headers}).then(res => res.data)
            console.log("RESPONSE: ", "response uploaded to the pre signed URL");
            sent = true
    
        }catch(err) {
            console.log(`sending response to S3 after ${count} trie(s) ${err}`);
            error = err
        }
    }

    if(sent == false) {
        console.log(`Failed to send response to S3 after ${count} trie(s) ${error}`);
        throw error
    }else {
        return sent
    }
}