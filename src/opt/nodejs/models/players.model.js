const { curry, get } = require('lodash/fp')
const { getConnection } = require('../mongodb.connector')
const mongoose = require('mongoose')
const {
    isValidPid,
    isValidSub,
    isValidEmail,
    isValidPlayerIds,
    isValidLongitude,
    isValidLatitude,
    isValidConnectionId,
    isValidLanguage,
    isValidCategory,
    isValidLevel,
    isValidNumber
} = require('../utils/validators/index')
const {
    invalidPidError,
    invalidSubError,
    invalidEmail,
    invalidPlayerIdsError,
    invalidLatitudeError,
    invalidLongitudeError,
    invalidConnectionIdError,
    invalidLanguageError,
    invalidLevelError,
    invalidCategoryError,
    invalidNumberError
} = require('../utils/errors/general')


const invalidModelError = () => new Error("INVALID_MODEL")
const failedToCreatePlayerError = () => new Error("FAILED_TO_CREATE_PLAYER")
const failedToFindUserByEmailError = () => new Error("FAILED_TO_FIND_USER_BY_EMAIL")
const failedToFindUserByIdError = () => new Error("FAILED_TO_FIND_USER_BY_ID")
const failedToGetPlayersConIdsError = () => new Error("FAILED_TO_GET_PLAYERS_CONN_IDS")
const failedToMarkPlayersAsPlayingError = () => new Error("FAILED_TO_MARK_PLAYERS_AS_PLAYING")
const failedToConvertIdToObjectIdError = () => new Error("FAILED_TO_CONVERT_ID_TO_OBJECT_ID")
const failedToConvertIdsToObjectIdsError = () => new Error("FAILED_TO_CONVERT_IDS_TO_OBJECT_IDS")
const failedToUpdatePlayerLocationError = () => new Error("FAILED_TO_UPDATE_PLAYER_LOCATION")
const failedToRegisterConnectionIdError = () => new Error("FAILED_TO_REGISTER_CONNECTION_ID")
const failedToDeregisterConnectionIdError = () => new Error("FAILED_TO_DEREGISTER_CONNECTION_ID")
const failedToSearchForPlayersError = () => new Error("FAILED_TO_SEARCH_FOR_PLAYERS")


const convertIdToObjectId = curry((converter, id) => {
    try {
        const objectIds = converter(id)
        return Promise.resolve(objectIds)
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToConvertIdToObjectIdError())
    }
})

const convertIdsToObjectIds = curry((converter, ids) => {
    try {
        const objectIds = ids.map(id => converter(id))
        return Promise.resolve(objectIds)
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToConvertIdsToObjectIdsError())
    }
})


const createPlayerSafe = curry(async (connection, sub, email) => {
    try {
        if(!isValidSub(sub))
        return Promise.reject(invalidSubError())

        if(!isValidEmail(email))
            return Promise.reject(invalidEmail())
        
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()
        
        return model.create({
            _id: sub, 
            email: email
        }).catch(err => {
            console.log(err)
            return Promise.reject(failedToCreatePlayerError())
        })

    }catch(err) {
        console.log(err)
        return Promise.reject(failedToCreatePlayerError())
    }    
})


const findUserByEmailSafe = curry(async (connection, email) => {
    try {
        if(!isValidEmail(email))
        return Promise.reject(invalidEmail())
        
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()
        
        return model.findOne({email}).catch(err => {
            console.log(err)
            return Promise.reject(failedToFindUserByEmailError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToFindUserByEmailError())
    }
})

const findUserByIdSafe = curry(async (connection, idConverter, pid) => {
    try {
        if(!isValidPid(pid))
        return Promise.reject(invalidPidError())
        
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()

        const objectId = await convertIdToObjectId(idConverter, pid)
        
        return model.findOne({ _id: objectId }).catch(err => {
            console.log(err)
            return Promise.reject(failedToFindUserByIdError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToFindUserByIdError())
    }
    
})


const getPlayersConIdsSafe = curry(async (connection, idConverter, playerIds) => {
    try {
        if(!isValidPlayerIds(playerIds))
        return Promise.reject(invalidPlayerIdsError())
    
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()

        const objectIds = await convertIdsToObjectIds(idConverter, playerIds)

        return model.find({ _id: {$in: objectIds} })
        .then(user => user.map(doc => doc.connectionId))
        .catch(err => {
            console.log(err)
            return Promise.reject(failedToGetPlayersConIdsError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToGetPlayersConIdsError())
    }
})

const markPlayersAsPlayingSafe = curry(async (connection, idConverter, playerIds) => {
    try {
        if(!isValidPlayerIds(playerIds))
        return Promise.reject(invalidPlayerIdsError())
    
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()

        const objectIds = await convertIdsToObjectIds(idConverter, playerIds)
        return model.updateMany({ _id: {$in: objectIds }}, { status: "PLAYING" })
        .catch(err => {
            console.log(err)
            return Promise.reject(failedToMarkPlayersAsPlayingError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToMarkPlayersAsPlayingError())
    }
})

const updatePlayersLocationSafe = curry(async (connection, connectionId, latitude, longitude) => {
    try {
        if(!isValidConnectionId(connectionId))
            return Promise.reject(invalidConnectionIdError())

        if(!isValidLatitude(latitude))
            return Promise.reject(invalidLatitudeError())
        
        if(!isValidLongitude(longitude))
            return Promise.reject(invalidLongitudeError())

        
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()

        const conditions = {
            connectionId: connectionId,
            status: "ready",
            online: true
        }
        const payload = {
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        }
        return model.updateOne(conditions, payload).catch(err => {
            console.log(err)
            return Promise.reject(failedToUpdatePlayerLocationError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToUpdatePlayerLocationError())
    }
})



const registerConnectionIdSafe = curry(async (connection, connectionId, email) => {
    try {

        if(!isValidConnectionId(connectionId))
            return Promise.reject(invalidConnectionIdError())

        if(!isValidEmail(email))
            return Promise.reject(invalidEmail())

        
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()
        
        const payload = {
            connectionId,
            status: "ready",
            online: true
        }
        return model.updateOne({email}, payload).catch(err => {
            console.log(err)
            return Promise.reject(failedToRegisterConnectionIdError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToRegisterConnectionIdError())
    }
})


const deregisterConnectionIdSafe = curry(async (connection, connectionId) => {
    try {

        if(!isValidConnectionId(connectionId))
            return Promise.reject(invalidConnectionIdError())

        
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()

        const payload = {
            online: false, 
            connectionId: "",
            status: "inactive"
        }
        return model.updateOne({connectionId}, payload).catch(err => {
            console.log(err)
            return Promise.reject(failedToDeregisterConnectionIdError())
        })
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToDeregisterConnectionIdError())
    }
})


const searchForPlayersSafe = curry(async (connection, idConverter, _id, latitude, longitude, language, category, level, maxDistance) => {
    try {

        if(!isValidLatitude(latitude))
            return Promise.reject(invalidLatitudeError())
        
        if(!isValidLongitude(longitude))
            return Promise.reject(invalidLongitudeError())

        if(!isValidPid(_id))
            return Promise.reject(invalidPidError())

        if(!isValidLanguage(language))
            return Promise.reject(invalidLanguageError())
        
        if(!isValidCategory(category))
            return Promise.reject(invalidCategoryError())

        if(!isValidLevel(level))
            return Promise.reject(invalidLevelError())

        if(!isValidNumber(maxDistance))
            return Promise.reject(invalidNumberError())
        
        let model = get("model", connection)
        if(!model)
            return Promise.reject(invalidModelError())

        model = model()

       
        const objectId = await convertIdToObjectId(idConverter, _id)

        const conditions = {
            online: true, 
            status: "READY",
            category,
            level,
            language,
            _id: {$ne: objectId}
        }
        return model.aggregate([
            {
             $geoNear: {
                near: { type: "Point", coordinates: [ longitude , latitude ] },
                distanceField: "distance",
                maxDistance,
                query: conditions,
                spherical: true
             }
           }
        ]).catch(err => {
            console.log(err)
            return Promise.reject(failedToSearchForPlayersError())
        })

    }catch(err) {
        console.log(err)
        return Promise.reject(failedToSearchForPlayersError())
    }
})


module.exports = {
    invalidModelError,
    failedToCreatePlayerError,
    failedToFindUserByEmailError,
    failedToFindUserByIdError,
    failedToGetPlayersConIdsError,
    failedToMarkPlayersAsPlayingError,
    failedToConvertIdToObjectIdError,
    failedToConvertIdsToObjectIdsError,
    failedToUpdatePlayerLocationError,
    failedToRegisterConnectionIdError,
    failedToDeregisterConnectionIdError,
    failedToSearchForPlayersError,
    convertIdsToObjectIds,
    convertIdToObjectId,
    createPlayerSafe,
    findUserByEmailSafe,
    findUserByIdSafe,
    getPlayersConIdsSafe,
    markPlayersAsPlayingSafe,
    updatePlayersLocationSafe,
    registerConnectionIdSafe,
    deregisterConnectionIdSafe,
    searchForPlayersSafe,
    createPlayer: currentCon => createPlayerSafe(getConnection(currentCon)),
    findUserByEmail: currentCon => findUserByEmailSafe(getConnection(currentCon)),
    findUserById: currentCon => findUserByIdSafe(getConnection(currentCon), mongoose.Types.ObjectId),
    getPlayersConIds: currentCon => getPlayersConIdsSafe(getConnection(currentCon), mongoose.Types.ObjectId),
    markPlayersAsPlaying: currentCon => markPlayersAsPlayingSafe(getConnection(currentCon), mongoose.Types.ObjectId),
    updatePlayersLocation: currentCon => 
        updatePlayersLocationSafe(getConnection(currentCon)),
    registerConnectionId: currentCon => registerConnectionIdSafe(getConnection(currentCon)),
    deregisterConnectionId: currentCon => deregisterConnectionIdSafe(getConnection(currentCon)),
    searchForPlayers: currentCon => searchForPlayersSafe(getConnection(currentCon))
}



// class PlayersModel {
//     constructor(playerSchema, mongoose, mongoConnector) {
//         this.db = mongoConnector
//         this._modelName = "Player";
//         this._schema = playerSchema;
//         this._mongoose = mongoose
//     }

//     async model() {
//         if(!Players._model) {
//             await this.db.initialize();
//             Players._model = this.db.connection().model(this._modelName, this._schema)
//         }
//         return Players._model
        
//     }

//     async createPlayer(payload) {
//         if(!payload.sub || !payload.email) {
//             return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
//         }
//         const model = await this.model()
//         return new Promise((resolve, reject) => {
//             model.create({
//                 _id: payload.sub, 
//                 email: payload.email
//             }, (err, user) => {
//                 if(err) { reject(err) }
//                 resolve("Player was created successfully!")
//             })
//         })
//     }


//     async findUserByEmail(email) {
//         if(email.trim().length == 0) {
//             return Promise.reject(new Error("NO_EMAIL_PROVIDED"))
//         }
//         const model = await this.model()
//         return new Promise((resolve, reject) => {
//             model.findOne({ email: email }, (err, user) => {
//                 if(err) { reject(err) }
//                 resolve(user)
//             });
//         })
//     }

//     async findUserById(id) {
//         if(id.trim().length == 0) {
//             return Promise.reject(new Error("NO_ID_PROVIDED"))
//         }
//         const model = await this.model()
//         const objectId = this._mongoose.Types.ObjectId(id)
//         return new Promise((resolve, reject) => {
//             model.findOne({ _id: objectId }, (err, user) => {
//                 if(err) { reject(err) }
//                 resolve(user)
//             });
//         })
//     }

//     async updatePlayersLocation(conId, lat, long) {
//         if(!conId || !lat || !long) {
//             return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
//         }
//         const model = await this.model();
//         return new Promise((resolve, reject) => {
//             const conditions = {
//                 connectionId: conId,
//                 status: "ready",
//                 online: true
//             }
//             const payload = {
//                 locaction: {
//                     type: "Point",
//                     coordinates: [long, lat]
//                 }
//             }
//             model.updateOne(conditions, payload, (err, res) => {
//                 if(err) {
//                     reject(err)
//                 }
//                 resolve(res);
//             })
//         });
//     }

//     async getPlayersConIds(pids) {
//         if(pids.length == 0) {
//             return Promise.reject(new Error("NO_IDS_PROVIDED"))
//         } 
//         const model = await this.model()
//         const objectIds = pids.map(id => this._mongoose.Types.ObjectId(id));
//         return new Promise((resolve, reject) => {
//             model.find({ _id: {$in: objectIds} }, (err, user) => {
//                 if(err) { reject(err) }
//                 resolve(user.map(doc => doc.connectionId))
//             });
//         })
//     }

//     async registerConnectionId(conId, email) {
//         if(!conId || !email) {
//             return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
//         }
//         const model = await this.model();
//         return new Promise((resolve, reject) => {
//             const payload = {
//                 connectionId: conId,
//                 status: "ready",
//                 online: true
//             }
//             model.updateOne({email: email}, payload, (err, res) => {
//                 if(err) {
//                     reject(err)
//                 }
//                 resolve(res);
//             })
//         });
//     }

//     async deregisterConnectionId(conId) {
//         if(!conId) {
//             return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
//         }
//         const model = await this.model();
//         return new Promise((resolve, reject) => {
//             const payload = {
//                 online: false, 
//                 connectionId: "",
//                 status: "inactive"
//             }
//             model.updateOne({connectionId: conId}, payload, (err, res) => {
//                 if(err) {
//                     return reject(err)
//                 }
//                 resolve(res)
//             })
//         });
//     }

//     async markPlayersAsPlaying(ids) {
//         if(ids.length == 0) {
//             return Promise.reject(new Error("NO_IDS_PROVIDED"))
//         }
//         const model = await this.model();
//         const objectIds = ids.map(id => this._mongoose.Types.ObjectId(id));
//         return model.updateMany({ _id: {$in: objectIds }}, { status: "PLAYING" });
//     }

//     async searchForPlayers(data) {
//         if(
//             !data._id || !data.location.lat || !data.location.long ||
//             !data.language || !data.category || !data.level
//         ) {
//             return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
//         }
//         const id = this._mongoose.Types.ObjectId(data._id);
//         return new Promise(async (resolve, reject) => {
//             const model = await this.model();
//             const conditions = {
//                 online: true, 
//                 status: "READY",
//                 category: data.category,
//                 level: data.level,
//                 language: data.language,
//                 _id: {$ne: id}
//             }
//             model.aggregate([
//                 {
//                  $geoNear: {
//                     near: { type: "Point", coordinates: [ data.location.long , data.location.lat ] },
//                     distanceField: "distance",
//                     maxDistance: Number(process.env.PLAYERS_DISTANCE),
//                     query: conditions,
//                     spherical: true
//                  }
//                }
//             ]).exec((err, res) => {
//             if(err) {
//                 reject(err)
//             }
//             resolve(res)
//             }
//             )
//         })
//     }
// }

// module.exports = () => {
//     const bottle = require('bottlejs').pop('click')
//     bottle.service("model.player", PlayersModel, "schema.player", "lib.mongoose", "connector.mongo")
// } 
