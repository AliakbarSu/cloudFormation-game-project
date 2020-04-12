// let layerPath = "../../../src/opt/nodejs/";
// if(!process.env['DEV']) {
//     layerPath = "/opt/nodejs/"
// }

// const PlayersModel = require(layerPath + 'models/players.js')
// const playerSchema = require(layerPath + 'schemas/players.schema')
// const mongodbconnector = require(layerPath + 'mongodb.connector')
// const CONSTANTS = require(layerPath + 'constants.js')
// const mongoose = require('mongoose')

// var chai = require('chai');
// const assert = chai.assert
// const sinon = require('sinon')




// xdescribe('Players Model', function() {
//   let spy, deps;
//   let PlayersModelObj;
//   let ObjectIdStub, execFake;
//   execFake = sinon.fake.yields(null, {})
//   let mockModel = {
//     find: sinon.fake.yields(null, []),
//     findOne: sinon.fake.yields(null, {}),
//     create: sinon.fake.yields(null, {}),
//     findMany: null,
//     update: null,
//     updateOne: sinon.fake.yields(null, {}),
//     updateMany: null,
//     aggregate: sinon.fake.returns({exec: execFake})
//   }
//   let modelStub;

//   deps = {
//     playerSchema,
//     mongodbconnector: mongodbconnector.mongoDbConnector,
//     mongoose,
//     CONSTANTS
//   }

//   this.beforeAll(() => {
//     CONSTANTS.PLAYERS_DISTANCE = 200;
//     PlayersModelObj = new PlayersModel.Players(deps)
//     modelStub = sinon.stub(PlayersModelObj, "model").resolves(mockModel)
//     ObjectIdStub = sinon.stub(mongoose.Types, "ObjectId").returnsArg(0)
//   })  

//   this.beforeEach(() => {
//   })

//   this.afterEach(() => {
//     execFake = sinon.fake.yields(null, {})
//     mockModel.aggregate = sinon.fake.returns({exec: execFake})
//     mockModel.updateOne = sinon.fake.yields(null, {})
//   })


//   describe("model", () => {
//     let modelName, schema;
//     let initializeStub, mongodbModelFake, connectionFake;

//     this.beforeAll(() => {
//       mongodbModelFake = sinon.fake.returns()
//       initializeStub = sinon.stub(mongodbconnector.mongoDbConnector, "initialize").resolves()
//       connectionFake = sinon.stub(mongodbconnector.mongoDbConnector, "connection").returns({model: mongodbModelFake})
//     })
//     this.beforeEach(() => {
//       modelName = "testModel"
//       schema = "testSchema"
//       mongodbModelFake = sinon.fake.returns("testData")
//       connectionFake.returns({model: mongodbModelFake})
//     })

//     this.afterEach(() => {
//       initializeStub.resetHistory()
//       connectionFake.resetHistory()
//     })

//     it("Should call mongodbconnector.initialize and pass correct args",  async () => {
//       PlayersModel.Players._model = null;
//       const PlayersModelObjTest = new PlayersModel.Players(deps)
//       await PlayersModelObjTest.model()
//       assert.equal(initializeStub.calledOnce, true)
//     });

//     it("Should return result from connection().model",  async () => {
//       PlayersModel.Players._model = null;
//       const PlayersModelObjTest = new PlayersModel.Players(deps)
//       const result = await PlayersModelObjTest.model()
//       assert.equal(result, "testData")
//     });


//     it("Should call mongodbconnector.connection().model and pass correct args",  async () => {
//       PlayersModel.Players._model = null;
//       const PlayersModelObjTest = new PlayersModel.Players(deps)
//       PlayersModelObjTest._schema = schema
//       PlayersModelObjTest._modelName = modelName
//       await PlayersModelObjTest.model()
//       assert.equal(initializeStub.calledOnce, true)
//       assert.equal(connectionFake.calledOnce, true)
//       assert.equal(mongodbModelFake.getCall(0).args[0], modelName)
//       assert.equal(mongodbModelFake.getCall(0).args[1], schema)
//     });
//   })

//   describe("findUserByEmail", () => {
//     it("Should call model.findOne and pass correct args",  async () => {
//       await PlayersModelObj.findUserByEmail("testUser")

//       assert.equal(mockModel.findOne.calledOnce, true)
//       assert.include(mockModel.findOne.getCall(0).args[0], {email: "testUser"})
  
//       mockModel.findOne = sinon.fake.yields(new Error("CON_ERROR"))
  
//       try {
//         await PlayersModelObj.findUserByEmail("testUser")
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }

//       mockModel.findOne = sinon.fake.yields(null, {})

//     });
  
//     it("Should reject when email to model.findOne is empty",  async () => {
//       try {
//         await PlayersModelObj.findUserByEmail("")
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "NO_EMAIL_PROVIDED")
//       }
//     });
//   })

//   describe("findUserById", () => {
//     it("Should call model.findOne and pass correct args",  async () => {
//       await PlayersModelObj.findUserById("testUser")
//       assert.equal(mockModel.findOne.calledOnce, true)
//       assert.include(mockModel.findOne.getCall(0).args[0], {_id: "testUser"})
  
//       mockModel.findOne = sinon.fake.yields(new Error("CON_ERROR"))
  
//       try {
//         await PlayersModelObj.findUserById("testUser")
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }

//       mockModel.findOne = sinon.fake.yields(null, {})
//     });
  
//     it("Should reject when id to model.findOne is empty",  async () => {
//       try {
//         await PlayersModelObj.findUserById("")
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "NO_ID_PROVIDED")
//       }
//     });
  
//   })

//   describe("getPlayersConIds", () => {
//     let playersIds;

//     this.beforeEach(() => {
//       playersIds = ["PlayerOne", "PlayerTwo"]
//     })

//     it("Should call model.find and pass correct args",  async () => {
//       await PlayersModelObj.getPlayersConIds(playersIds)
//       assert.equal(mockModel.find.calledOnce, true)
//       assert.deepNestedInclude(mockModel.find.getCall(0).args[0], {_id: {$in: playersIds}})
  
//       mockModel.find = sinon.fake.yields(new Error("CON_ERROR"))
  
//       try {
//         await PlayersModelObj.getPlayersConIds(playersIds)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }
      
//       mockModel.find = sinon.fake.yields(null, [])
//     });

//     it("Should return only the connectionIds",  async () => {
//       const playersObj = playersIds.map(p => ({_id: p, connectionId: p}))
//       mockModel.find = sinon.fake.yields(null, playersObj)

//       const result = await PlayersModelObj.getPlayersConIds(playersIds)

//       assert.equal(mockModel.find.calledOnce, true)
//       assert.sameMembers(result, playersObj.map(p => p.connectionId))

//       mockModel.find = sinon.fake.yields(null, playersIds)
//     });
  
//     it("Should reject when id array to model.find is empty",  async () => {
//       try {
//         await PlayersModelObj.getPlayersConIds([])
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "NO_IDS_PROVIDED")
//       }
//     });
//   })

//   describe("markPlayersAsPlaying", () => {
//     let playersIds;

//     this.beforeEach(() => {
//       playersIds = ["5e68bdc676693400080760a5", "34376231343462612d643738"]
//       mockModel.updateMany = sinon.fake.resolves()
//     })

//     it("Should call model.updateMany and pass correct args",  async () => {

//       await PlayersModelObj.markPlayersAsPlaying(playersIds)

//       assert.equal(mockModel.updateMany.calledOnce, true)
//       assert.deepNestedInclude(mockModel.updateMany.getCall(0).args[0], {_id: {$in: playersIds}})
//       assert.deepNestedInclude(mockModel.updateMany.getCall(0).args[1], {status: "PLAYING"})
  
//       mockModel.updateMany = sinon.fake.rejects(new Error("CON_ERROR"))
  
//       try {
//         await PlayersModelObj.markPlayersAsPlaying(playersIds)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }
//     });
  
//     it("Should reject when id array markPlayersAsPlaying is empty",  async () => {
//       try {
//         await PlayersModelObj.markPlayersAsPlaying([])
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "NO_IDS_PROVIDED")
//       }
//     });
  
//   })

//   describe("searchForPlayers", () => {
//     let playerData;

//     this.beforeEach(() => {
//       playerData = {
//         location: {
//           lat: 42424,
//           long: 42424
//         },
//         _id: "Test_user_id",
//         category: "Test_category",
//         language: "english",
//         level: 1
//       }
//     })

//     it("Should call model.aggregate and pass correct args",  async () => {

//       await PlayersModelObj.searchForPlayers(playerData)

//       const conditions = {
//         level: playerData.level,
//         category: playerData.category,
//         language: playerData.language
//       }

//       assert.equal(mockModel.aggregate.calledOnce, true)
//       assert.deepEqual(mockModel.aggregate.getCall(0).args[0][0].$geoNear.near.coordinates, 
//         [playerData.location.long, playerData.location.lat])

//       assert.deepInclude(mockModel.aggregate.getCall(0).args[0][0].$geoNear.query, 
//         conditions)

//       execFake = sinon.fake.yields(new Error("CON_ERROR"))
//       mockModel.aggregate = sinon.fake.returns({exec: execFake})
  
//       try {
//         await PlayersModelObj.searchForPlayers(playerData)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }
//     });


//     it("Should reject when provided user data is invalid",  async () => {
//       playerData = {}
//       try {
//         await PlayersModelObj.searchForPlayers(playerData)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "PROVIDED_USER_DATA_IS_INVALID")
//       }
//     });
//   })


//   describe("CreatePlayer", () => {
//     let playerData;

//     this.beforeEach(() => {
//       playerData = {
//         email: "test@user.com",
//         sub: "testuser"
//       }
//     })

//     it("Should call model.create and pass correct args",  async () => {

//       await PlayersModelObj.createPlayer(playerData)

//       assert.equal(mockModel.create.calledOnce, true)
//       const expectedData = {
//         _id: playerData.sub,
//         email: playerData.email
//       }
//       assert.deepEqual(mockModel.create.getCall(0).args[0], expectedData)

//       mockModel.create = sinon.fake.yields(new Error("CON_ERROR"))
  
//       try {
//         await PlayersModelObj.createPlayer(playerData)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }
//     });


//     it("Should reject when provided user data is invalid",  async () => {
//       playerData = {
//         email: ""
//       }
//       try {
//         await PlayersModelObj.createPlayer(playerData)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "PROVIDED_USER_DATA_IS_INVALID")
//       }
//     });
//   })

//   describe("registerConnectionId", () => {
//     let playerData;

//     this.beforeEach(() => {
//       playerData = {
//         email: "test@user.com",
//         conId: "testuser"
//       }
//     })

//     it("Should call model.updateOne and pass correct args",  async () => {

//       await PlayersModelObj.registerConnectionId(playerData.conId, playerData.email)

//       assert.equal(mockModel.updateOne.calledOnce, true)
//       const expectedData = {
//         connectionId: playerData.conId,
//         status: "ready",
//         online: true
//       }
//       assert.deepEqual(mockModel.updateOne.getCall(0).args[0], {email: playerData.email})
//       assert.deepEqual(mockModel.updateOne.getCall(0).args[1], expectedData)

//       mockModel.updateOne = sinon.fake.yields(new Error("CON_ERROR"))
  
//       try {
//         await PlayersModelObj.registerConnectionId(playerData.conId, playerData.email)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }
//     });


//     it("Should reject when provided user data is invalid",  async () => {
//       playerData = {
//         email: ""
//       }
//       try {
//         await PlayersModelObj.registerConnectionId(playerData)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "PROVIDED_USER_DATA_IS_INVALID")
//       }
//     });
//   })

//   describe("deregisterConnectionId", () => {
//     let playerConId;

//     this.beforeEach(() => {
//       playerConId = "testID"
//     })

//     it("Should call model.updateOne and pass correct args",  async () => {

//       await PlayersModelObj.deregisterConnectionId(playerConId)

//       assert.equal(mockModel.updateOne.calledOnce, true)
//       const expectedData = {
//         connectionId: "",
//         status: "inactive",
//         online: false
//       }
//       assert.deepEqual(mockModel.updateOne.getCall(0).args[0], {connectionId: playerConId})
//       assert.deepEqual(mockModel.updateOne.getCall(0).args[1], expectedData)

//       mockModel.updateOne = sinon.fake.yields(new Error("CON_ERROR"))
  
//       try {
//         await PlayersModelObj.deregisterConnectionId(playerConId)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "CON_ERROR")
//       }
//     });


//     it("Should reject when provided user data is invalid",  async () => {
//       try {
//         await PlayersModelObj.deregisterConnectionId(null)
//         throw new Error("FALSE PASS")
//       }catch(err) {
//         assert.equal(err.message, "PROVIDED_USER_DATA_IS_INVALID")
//       }
//     });
//   })
// });