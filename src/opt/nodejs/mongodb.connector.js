'use strict';
const mongoose = require('mongoose');
const CONSTANTS = require('./constants');


class MongoDbConnector {
    constructor(deps) {
        this.deps = deps
    }

    initialize() {
        if (!MongoDbConnector._connector) {
            MongoDbConnector._connector = this.deps.mongoose.createConnection(
                this.deps.CONSTANTS.MONGO_DB_URI, {
                bufferCommands: false, // Disable mongoose buffering
                bufferMaxEntries: 0 // and MongoDB driver buffering
            });
        }
        return MongoDbConnector._connector;
    }

    connection() {
        return MongoDbConnector._connector;
    }

    
}


exports.mongoDbConnector = new MongoDbConnector({
    CONSTANTS,
    mongoose
})

exports.MongoDbConnector = MongoDbConnector
