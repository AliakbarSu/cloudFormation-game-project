'use strict';
const mongoose = require('mongoose');


class MongoDbConnector {
    constructor() {}

    initialize() {
        if (!MongoDbConnector._connector) {
            MongoDbConnector._connector = mongoose.createConnection(
                process.env.MONGO_DB_URI, {
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



module.exports = () => {
    const bottle = require('bottlejs').pop("click")
    bottle.factory("connector.mongo", async function(container) {
        const mongodbConnector = new MongoDbConnector()
        const connector = await mongodbConnector.initialize()
        return connector
    })
} 
