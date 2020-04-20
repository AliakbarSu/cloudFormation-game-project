const {
    sValidNumber,
    isValidLatitude,
    isValidLongitude,
    isValidPlayerIds,
    isValidQuestionId,
    isValidGameId,
    isValidUserPool,
    isValidUsername,
    isValidPassword,
    isValidLimit,
    isValidTableName,
    isValidRequestId,
    isValidPid,
    isValidConnectionId,
    isValidLevel,
    isValidCategory,
    isValidLanguage,
    isValidSub,
    isValidToken,
    isUrlValid,
    isValidTokenExp,
    isValidAud,
    isValidKey,
    isValidUrl,
    isValidQueueUrl,
    isValidEmail,
} = require('../../../../src/opt/nodejs/utils/validators/index')



const sinon = require('sinon')
var chai = require('chai');
const expect = chai.expect
const fake = sinon.fake
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)


describe("Utils::validators::index", function() {
    
})