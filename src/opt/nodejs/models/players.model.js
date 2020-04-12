
class PlayersModel {
    constructor(playerSchema, mongoose, mongoConnector) {
        this.db = mongoConnector
        this._modelName = "Player";
        this._schema = playerSchema;
        this._mongoose = mongoose
    }

    async model() {
        if(!Players._model) {
            await this.db.initialize();
            Players._model = this.db.connection().model(this._modelName, this._schema)
        }
        return Players._model
        
    }

    async createPlayer(payload) {
        if(!payload.sub || !payload.email) {
            return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
        }
        const model = await this.model()
        return new Promise((resolve, reject) => {
            model.create({
                _id: payload.sub, 
                email: payload.email
            }, (err, user) => {
                if(err) { reject(err) }
                resolve("Player was created successfully!")
            })
        })
    }


    async findUserByEmail(email) {
        if(email.trim().length == 0) {
            return Promise.reject(new Error("NO_EMAIL_PROVIDED"))
        }
        const model = await this.model()
        return new Promise((resolve, reject) => {
            model.findOne({ email: email }, (err, user) => {
                if(err) { reject(err) }
                resolve(user)
            });
        })
    }

    async findUserById(id) {
        if(id.trim().length == 0) {
            return Promise.reject(new Error("NO_ID_PROVIDED"))
        }
        const model = await this.model()
        const objectId = this._mongoose.Types.ObjectId(id)
        return new Promise((resolve, reject) => {
            model.findOne({ _id: objectId }, (err, user) => {
                if(err) { reject(err) }
                resolve(user)
            });
        })
    }

    async updatePlayersLocation(conId, lat, long) {
        if(!conId || !lat || !long) {
            return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
        }
        const model = await this.model();
        return new Promise((resolve, reject) => {
            const conditions = {
                connectionId: conId,
                status: "ready",
                online: true
            }
            const payload = {
                locaction: {
                    type: "Point",
                    coordinates: [long, lat]
                }
            }
            model.updateOne(conditions, payload, (err, res) => {
                if(err) {
                    reject(err)
                }
                resolve(res);
            })
        });
    }

    async getPlayersConIds(pids) {
        if(pids.length == 0) {
            return Promise.reject(new Error("NO_IDS_PROVIDED"))
        } 
        const model = await this.model()
        const objectIds = pids.map(id => this._mongoose.Types.ObjectId(id));
        return new Promise((resolve, reject) => {
            model.find({ _id: {$in: objectIds} }, (err, user) => {
                if(err) { reject(err) }
                resolve(user.map(doc => doc.connectionId))
            });
        })
    }

    async registerConnectionId(conId, email) {
        if(!conId || !email) {
            return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
        }
        const model = await this.model();
        return new Promise((resolve, reject) => {
            const payload = {
                connectionId: conId,
                status: "ready",
                online: true
            }
            model.updateOne({email: email}, payload, (err, res) => {
                if(err) {
                    reject(err)
                }
                resolve(res);
            })
        });
    }

    async deregisterConnectionId(conId) {
        if(!conId) {
            return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
        }
        const model = await this.model();
        return new Promise((resolve, reject) => {
            const payload = {
                online: false, 
                connectionId: "",
                status: "inactive"
            }
            model.updateOne({connectionId: conId}, payload, (err, res) => {
                if(err) {
                    return reject(err)
                }
                resolve(res)
            })
        });
    }

    async markPlayersAsPlaying(ids) {
        if(ids.length == 0) {
            return Promise.reject(new Error("NO_IDS_PROVIDED"))
        }
        const model = await this.model();
        const objectIds = ids.map(id => this._mongoose.Types.ObjectId(id));
        return model.updateMany({ _id: {$in: objectIds }}, { status: "PLAYING" });
    }

    async searchForPlayers(data) {
        if(
            !data._id || !data.location.lat || !data.location.long ||
            !data.language || !data.category || !data.level
        ) {
            return Promise.reject(new Error("PROVIDED_USER_DATA_IS_INVALID"))
        }
        const id = this._mongoose.Types.ObjectId(data._id);
        return new Promise(async (resolve, reject) => {
            const model = await this.model();
            const conditions = {
                online: true, 
                status: "READY",
                category: data.category,
                level: data.level,
                language: data.language,
                _id: {$ne: id}
            }
            model.aggregate([
                {
                 $geoNear: {
                    near: { type: "Point", coordinates: [ data.location.long , data.location.lat ] },
                    distanceField: "distance",
                    maxDistance: Number(process.env.PLAYERS_DISTANCE),
                    query: conditions,
                    spherical: true
                 }
               }
            ]).exec((err, res) => {
            if(err) {
                reject(err)
            }
            resolve(res)
            }
            )
        })
    }
}

module.exports = () => {
    const bottle = require('bottlejs').pop('click')
    bottle.service("model.player", PlayersModel, "schema.player", "lib.mongoose", "connector.mongo")
} 
