const Bottle = require('bottlejs').pop("click")
const bottle = Bottle

const playerSchema = require('./schemas/players.schema');
const mongoose = require('mongoose')
const MongodbConnector = require('./mongodb.connector')
const DynamodbConnector = require('./dynamodb.connector')
const CognitoConnector = require('./cognito.connector')
const SqsConnector = require('./sqs.connector')
const ApigatewayConnector = require('./apigateway.connector')
const PlayersModel = require('./models/players.model')
const QuestionsModel = require('./models/questions.model')
const GameModel = require('./models/game.model')
const RequestModel = require('./models/request.model')
const AWS = require('aws-sdk')
const cognitosdk = require('amazon-cognito-identity-js');
const uuid = require('uuid')
const ParseToken = require('./utils/auth/index')
const convertSubToUid = require('./utils/auth/convert-to-sub')
const mapError = require('./utils/error')




MongodbConnector()
DynamodbConnector()
CognitoConnector()
SqsConnector()
ApigatewayConnector()
PlayersModel()
QuestionsModel()
GameModel()
RequestModel()
ParseToken()
convertSubToUid()





bottle.factory("schema.player", function(container) {
    return new container.lib.mongoose.Schema(playerSchema, {timestamps: true}); 
})

bottle.factory("lib.mongoose", function(container) {
    return mongoose
})
bottle.factory("lib.aws", function(container) {
    return AWS
})
bottle.factory("lib.cognito", function(container) {
    return cognitosdk
})
bottle.factory("lib.uuid", function(container) {
    return uuid
})
bottle.service("utils.mapError", mapError)


