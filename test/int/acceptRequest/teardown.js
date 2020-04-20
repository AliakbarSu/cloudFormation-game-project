const { exec } = require("child_process")
const AWS = require('aws-sdk')
require('dotenv').config()



exports.deleteLambdaFunction = config => {
    return new Promise((success, fail) => {
        const credentials = {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        }
    
        const lambda = new AWS.Lambda({
            region: "us-east-1",
            credentials,
            endpoint: 'http://localhost:4574',
            s3ForcePathStyle: true,
        })
        var params = {
            FunctionName: config.FunctionName
        }
    
        lambda.deleteFunction(params, function(err, data) {
            if (err) {
                console.log(err)
                fail(err)
            }else {
                success(data)
            }
        })
    })
}



exports.stopLocalStack = (image_name) => {
    return new Promise((resolve, reject) => {
        exec("docker stop " + image_name, (error, stdout, stderr) => {
            if (error) {
                return reject(`error: ${error.message}`)
            }
            resolve()
        })
    })
}