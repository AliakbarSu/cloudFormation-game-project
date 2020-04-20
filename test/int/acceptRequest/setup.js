
var fs = require('fs')
var archiver = require('archiver')
const { exec } = require("child_process")
const AWS = require('aws-sdk')
const path = require('path')
require('dotenv').config()


const createDeploymentPackage = (code_path, package_name) => {
    return new Promise((success, fail) => {
        const output = fs.createWriteStream(__dirname + `/${package_name}.zip`);
        const archive = archiver('zip', { zlib: { level: 9 }})
    
        output.on('close', function() {
            success(archive.pointer() + ' total bytes')
        })
        output.on('end', function() {
            success('Data has been drained')
        })
        archive.on('error', function(err) {
            fail(err)
        })
        archive.pipe(output)
        const dep_path = path.resolve(__dirname, code_path)
        archive.directory(dep_path, false);
        archive.finalize()
        success("package created")
    }).then(() => new Promise((resolve) => setTimeout(resolve, 6000)))
}



exports.spinUpLambdaLayer = (config, codePath) => {
    return new Promise(async (resolve, reject) => {
        await createDeploymentPackage(codePath, "layer").catch(err => {
            console.log(err)
            return Promise.reject("failed to create deployment package")
        })

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
        delete config.ContentUri
        delete config.RetentionPolicy
        var code_path =  path.resolve(__dirname,'./layer.zip')
        var params = {
            ...config,
            Content: {
              ZipFile: fs.readFileSync(code_path)
            }
          };
          lambda.publishLayerVersion(params, function(err, data) {
            if (err) {
                reject(err)
            }else {
                resolve("Layer created")
            }
        })
    })
}


exports.spinUpLambda = (config, codePath) => {
    
    return new Promise(async (success, fail) => {
        await createDeploymentPackage(codePath, "package").catch(err => {
            console.log(err)
            return Promise.reject("failed to create deployment package")
        })

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
        var code_path =  path.resolve(__dirname,'./package.zip')
        var params = {
            Code: { /* required */
              ZipFile: fs.readFileSync(code_path)
            },
            FunctionName: config.FunctionName, /* required */
            Handler: config.Handler, /* required */
            Role: config.Role, /* required */
            Runtime: 'nodejs8.10',
            Environment: config.Environment,
            Layers: config.Layers.map(ly => ly.Ref),
            MemorySize: config.MemorySize,
            Timeout: config.Timeout
        }

        lambda.createFunction(params, function(err, data) {
            if (err) {
                console.log(err)
                fail(err)
            }else {
                success(data)
            }
        })
    })
}