onst mongoose = require('mongoose');
let conn;
const dburi = "mongodb+srv://admin:extra4545@cluster0-xebut.mongodb.net/test";
let Player;


const types = mongoose.Schema.Types;


// let send = undefined;
// function init(event) {
//   const apigwManagementApi = new AWS.ApiGatewayManagementApi({
//     apiVersion: '2018-11-29',
//     endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
//   });
//   send = async (connectionId, data) => {
//     await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: `Echo: ${data}` }).promise();
//   }
// }

exports.handler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    if (conn == null) {
        conn = await mongoose.createConnection(dburi, {
          bufferCommands: false, // Disable mongoose buffering
          bufferMaxEntries: 0 // and MongoDB driver buffering
        });
        conn.model('Player', createPlayerSchema());
    }
     
   Player = conn.model('Player');
   const conId = event.connectionId;
   const lat = Number(event.data.latitude);
   const long = Number(event.data.longitude);
  try {
      return updateLocation(conId, lat, long)
  }catch(err) {
      console.log(err)
      throw err;
  }
  
 
  
  
};


function updateLocation(conId, lat, long) {
    return new Promise((resolve, reject) => {
        const conditions = {
              connectionId: conId,
              status: "READY",
              online: true
          }
         const payload = {
             location: {
                 type: "Point",
                 coordinates: [long, lat]
             }
         }
         Player.updateOne(conditions, payload, (err, res) => {
          if(err) {
              console.log(err)
              reject(err)
          }
          resolve(res);
        })
    });
}


function createPlayerSchema() {
    return new mongoose.Schema({
    pid: types.ObjectId,
    online: Boolean,
    level: Number,
    email: String,
    connectionId: String,
    categories: [String],
    last_connected: String,
    wins: Number,
    losses: Number,
    points: [{
        redeemable: Boolean,
        value: {type: Number, default: 1}
    }],
    status: {
        type: String, 
        default: "INACTIVE", 
        enum: ['INACTIVE', 'READY', 'PLAYING'],
        uppercase: true
    },
    location: {type: {type: String}, coordinates: [Number]}
}, {timestamps: true})
}