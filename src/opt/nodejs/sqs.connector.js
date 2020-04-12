


class SqsConnector {
    constructor(aws) {
      this._urls = {
        pendingRequests: process.env.SQS_PENDINGREQUESTS_URL,
        scheduleNextQuestion: process.env.SQS_SCHEDULE_NEXT_QUESTION_URL
      };
      this.sqs = new aws.SQS({apiVersion: '2012-11-05'});
    }

    addRequest(requestId, playerIds) {
      if(!requestId || !playerIds || playerIds.length == 0) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
      }
        return new Promise((resolve, reject) => {
            const PIDS = {
                ids: playerIds
            }
            const PIDSJSON = JSON.stringify(PIDS)
            var params = {
                DelaySeconds: 10,
                MessageAttributes: {
                  "requestId": {
                    DataType: "String",
                    StringValue: requestId
                  },
                  "playerIds": {
                    DataType: "String",
                    StringValue: PIDSJSON
                  }
                },
                MessageBody: "New Pending Request",
                QueueUrl: this._urls.pendingRequests
              };
              
              this.sqs.sendMessage(params, function(err, data) {
                if (err) {
                  reject(err)
                } else {
                  resolve(data.MessageId);
                }
            });
        })
    }

    async scheduleNextQuestion(gid) {
      if(!gid) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
      }
      return new Promise((resolve, reject) => {
          var params = {
              DelaySeconds: 10,
              MessageAttributes: {
                "gameId": {
                  DataType: "String",
                  StringValue: gid
                }
              },
              MessageBody: "New question to be fetched",
              QueueUrl: this._urls.scheduleNextQuestion
            };
            
            this.sqs.sendMessage(params, function(err, data) {
              if (err) {
                reject(err)
              } else {
                resolve(data.MessageId);
              }
          });
      })
    }
}


module.exports = () => {
  const bottle = require('bottlejs').pop("click")
  bottle.service("connector.sqs", SqsConnector, "lib.aws")
} 




