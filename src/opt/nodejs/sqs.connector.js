const aws = require("aws-sdk")
const { curry, get } = require('lodash/fp')
const {
  isValidRequestId,
  isValidPid,
  isValidQueueUrl,
  isValidGameId
} = require("./utils/validators/index")
const {
  invalidQueueUrlError,
  invalidGameIdError,
  invalidRequestIdError
} = require('./utils/errors/general')

const invalidSendMethodError = () => new Error("INVALID_SEND_METHOD")
const invalidParamsError = () => new Error("INVALID_PARAMS_ERROR")
const invalidPlayerIdsError = () => new Error("PLAYER_IDS_ARRAY_CONTAINS_INVALID_ID")
const failedToAddRequestError = () => new Error("FAILED_TO_ADD_REQUEST")
const failedToSqueduleNextQuestionError = () => new Error("FAILED_TO_SCHEDULE_NEXT_QUESTION")
const failedToGetSendMessageMethodError = () => new Error("FAILED_TO_GET_SEND_MESSAGE_METHOD")
const failedToConvertIdsToJsonError = () => new Error("FAILED_TO_CONVERT_IDS_TO_JSON")


const constructQuestionObject = curry((DelaySeconds, gameId, MessageBody, QueueUrl) => {
  return {
    DelaySeconds,
    MessageAttributes: {
      "gameId": {
        DataType: "String",
        StringValue: gameId
      }
    },
    MessageBody,
    QueueUrl
  }
})

const constructRequestObject = curry((DelaySeconds, requestId, playerIds, MessageBody, QueueUrl) => {
  return {
    DelaySeconds,
    MessageAttributes: {
      "requestId": {
        DataType: "String",
        StringValue: requestId
      },
      "playerIds": {
        DataType: "String",
        StringValue: playerIds
      }
    },
    MessageBody,
    QueueUrl
  }
})


const convertIdsToJson = curry((stringifier, ids) => {
  try {
    const stringifiedIds = stringifier(ids)
    return Promise.resolve(stringifiedIds)
  }catch(err) {
    return Promise.reject(failedToConvertIdsToJsonError())
  }
})

const validatePlayerIds = ids => {
  if(!ids)
    return false
  const invalidIds = ids.filter(id => !isValidPid(id))
  return invalidIds.length == 0
}


const sendMessage = curry((send, params) => {
  if(!send)
    return Promise.reject(invalidSendMethodError())
  if(!params)
    return Promise.reject(invalidParamsError())

  return new Promise((success, fail) => {
    send(params, (err, data) => {
      if(err)
        fail(err)
      success(data)
    })
  })
})

const addRequestSafe = curry(async (sqs, stringifier, queueUrl, requestId, playerIds) => {

  if(!isValidQueueUrl(queueUrl))
    return Promise.reject(invalidQueueUrlError())

  if(!isValidRequestId(requestId))
    return Promise.reject(invalidRequestIdError())

  if(!validatePlayerIds(playerIds))
    return Promise.reject(invalidPlayerIdsError())

  const send = get("sendMessage", sqs)

  if(!send)
    return Promise.reject(failedToGetSendMessageMethodError())

  const playersIdsJson = await convertIdsToJson(stringifier, playerIds)

  const params = constructRequestObject(10, requestId, playersIdsJson, "New Request Available", queueUrl)
  
  return sendMessage(send, params).catch(err => {
    console.log(err)
    return Promise.reject(failedToAddRequestError())
  })

})

const scheduleNextQuestionSafe = curry(async (sqs, queueUrl, gameId) => {

  if(!isValidQueueUrl(queueUrl))
    return Promise.reject(invalidQueueUrlError())

  if(!isValidGameId(gameId))
    return Promise.reject(invalidGameIdError())

  const send = get("sendMessage", sqs)

  if(!send)
    return Promise.reject(failedToGetSendMessageMethodError())

  const params = constructQuestionObject(10, gameId, "New question to be fetched", queueUrl)

  return sendMessage(send, params).catch(err => {
    console.log(err)
    return Promise.reject(failedToSqueduleNextQuestionError())
  })
})



module.exports = {
  failedToConvertIdsToJsonError,
  failedToAddRequestError,
  failedToGetSendMessageMethodError,
  failedToSqueduleNextQuestionError,
  invalidSendMethodError,
  invalidPlayerIdsError,
  invalidParamsError,
  constructQuestionObject,
  constructRequestObject,
  convertIdsToJson,
  sendMessage,
  addRequestSafe,
  scheduleNextQuestionSafe,
  validatePlayerIds,
  addRequest: addRequestSafe(new aws.SQS({apiVersion: '2012-11-05'}), JSON.stringify),
  scheduleNextQuestion: scheduleNextQuestionSafe(new aws.SQS({apiVersion: '2012-11-05'}))
}



// class SqsConnector {
//     constructor(aws) {
//       this._urls = {
//         pendingRequests: process.env.SQS_PENDINGREQUESTS_URL,
//         scheduleNextQuestion: process.env.SQS_SCHEDULE_NEXT_QUESTION_URL
//       };
//       this.sqs = new aws.SQS({apiVersion: '2012-11-05'});
//     }

//     addRequest(requestId, playerIds) {
//       if(!requestId || !playerIds || playerIds.length == 0) {
//         return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
//       }
//         return new Promise((resolve, reject) => {
//             const PIDS = {
//                 ids: playerIds
//             }
//             const PIDSJSON = JSON.stringify(PIDS)
//             var params = {
//                 DelaySeconds: 10,
//                 MessageAttributes: {
//                   "requestId": {
//                     DataType: "String",
//                     StringValue: requestId
//                   },
//                   "playerIds": {
//                     DataType: "String",
//                     StringValue: PIDSJSON
//                   }
//                 },
//                 MessageBody: "New Pending Request",
//                 QueueUrl: this._urls.pendingRequests
//               };
              
//               this.sqs.sendMessage(params, function(err, data) {
//                 if (err) {
//                   reject(err)
//                 } else {
//                   resolve(data.MessageId);
//                 }
//             });
//         })
//     }

//     async scheduleNextQuestion(gid) {
//       if(!gid) {
//         return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
//       }
//       return new Promise((resolve, reject) => {
//           var params = {
//               DelaySeconds: 10,
//               MessageAttributes: {
//                 "gameId": {
//                   DataType: "String",
//                   StringValue: gid
//                 }
//               },
//               MessageBody: "New question to be fetched",
//               QueueUrl: this._urls.scheduleNextQuestion
//             };
            
//             this.sqs.sendMessage(params, function(err, data) {
//               if (err) {
//                 reject(err)
//               } else {
//                 resolve(data.MessageId);
//               }
//           });
//       })
//     }
// }


// module.exports = () => {
//   const bottle = require('bottlejs').pop("click")
//   bottle.service("connector.sqs", SqsConnector, "lib.aws")
// } 




