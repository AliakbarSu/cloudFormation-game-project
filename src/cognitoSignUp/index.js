global.fetch = require('node-fetch');

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

exports.handler = (event, context, callback) => {
    // TODO implement
    var poolData = {
        UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
        ClientId: process.env.USER_POOL_CLIENT_ID, // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
     
    var attributeList = [];
     
    var dataEmail = {
        Name: 'email',
        Value: event.email,
    };
    
    
    var dataFamilyName = {
        Name: 'family_name',
        Value: event.surname,
    };
    
    var dataName = {
        Name: 'given_name',
        Value: event.name,
    };
    
    var dataBirthdate = {
        Name: 'birthdate',
        Value: event.dob,
    };
    
    
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(
        dataFamilyName
    );
    var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(
        dataName
    );
    var attributeBirthdate = new AmazonCognitoIdentity.CognitoUserAttribute(
        dataBirthdate
    );
     
    attributeList.push(attributeEmail);
    attributeList.push(attributeFamilyName);
    attributeList.push(attributeGivenName);
    attributeList.push(attributeBirthdate);
     
    userPool.signUp(event.username, event.password, attributeList, null, function(
        err,
        result
    ) {
        if (err) {
            console.log(err.message || JSON.stringify(err));
            var myErrorObj = {
                errorType : "InternalServerError",
                httpStatus : 500,
                requestId : context.awsRequestId,
                message : "An unknown error has occurred. Please try again."
            }
            callback(JSON.stringify(myErrorObj))
        }
        var cognitoUser = result.user;
        const response = {
            statusCode: 200,
            body: cognitoUser.getUsername() + " was created successfully",
        };
        callback(null, response);
    });
};
