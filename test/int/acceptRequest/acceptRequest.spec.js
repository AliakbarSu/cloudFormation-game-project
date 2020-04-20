
const { handler } = require('../../../src/acceptRequest/index')
const YAML = require('yaml')
const sinon = require('sinon')
const fs = require("fs")
const path = require("path")
var AWS = require('aws-sdk');
const mongoose = require('mongoose')
const chai = require('chai')
const expect = chai.expect
const { exec } = require("child_process");


const { spinUpLocalStack, spinUpLambda, spinUpLambdaLayer } = require('./setup')
const { stopLocalStack, deleteLambdaFunction } = require('./teardown')

describe("Integration::acceptRequest", function() {
    var template_path =  path.resolve(__dirname,'../../../template.yaml')
    const file = fs.readFileSync(template_path, 'utf8')
    const template = YAML.parse(file)

    this.beforeAll(async function() {
        this.timeout(10000000)
        await new Promise(async (success, fail) => {
            
            try {
                const layerCodePath = '../../../src/opt'
                await spinUpLambdaLayer(template.Resources.serverlessLayer.Properties, layerCodePath)
                const lambdaCodePath = '../../../src/acceptRequest'
                await spinUpLambda(template.Resources.acceptRequest.Properties, lambdaCodePath)
                success("setup completed")
            }catch(err) {
                console.log(err)
                fail(err)
            }
        })   
    })

    // this.afterAll(async function() {
    //     this.timeout(10000000)
    //     await new Promise(async (success, fail) => {
    //         try {
    //             await deleteLambdaFunction(template.Resources.acceptRequest.Properties)
    //             success("teardown completed")
    //         }catch(err) {
    //             console.log(err)
    //             fail(err)
    //         }
    //     })   
    // })

    it("Should pass", () => {
        expect(true).to.be.true
    })
    
})