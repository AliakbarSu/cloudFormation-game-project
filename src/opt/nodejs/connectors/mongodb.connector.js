'use strict';

const { curry } = require('lodash/fp')
const mongoose = require('mongoose')


const failedToCreateMongoDBConnectionError = () => new Error("CREATE_TO_CREATE_MONGO_DB_CONNECTION")
const invalidMongoDbURIConStringError = () => new Error("INVALID_MONGO_DB_CONNECTION_STRING")
const invalidBufferCommandError = () => new Error("INVALID_BUFFER_COMMAND")
const invalidBufferMaxEntriesError = () => new Error("INVALID_BUFFER_MAX_ENTRIES")


const validateConnectionString = uri => uri !== null && uri !== undefined && uri.length > 0  == true
const validateBufferCommands = bfc => typeof bfc === "boolean"
const validateBufferMaxEntries = BME => typeof BME == "number" 


const createConnectionObject = curry((bufferCommands, bufferMaxEntries) => ({
    bufferCommands, // Disable mongoose buffering
    bufferMaxEntries // and MongoDB driver buffering
}))


const createConnection = curry(async (createConnection, URI, connectionObject) => {
    try {
        const connection = await createConnection(URI, connectionObject)
        return connection
    }catch(err) {
        console.log(err)
        return Promise.reject(failedToCreateMongoDBConnectionError())
    }
})

let currentConnection = null


const getConnectionSafe = curry((currentConnection, createConn, bufferCommands, bufferMaxEntries, URI) => {

    if(!validateConnectionString(URI)) {
        return Promise.reject(invalidMongoDbURIConStringError())
    }
    if(!validateBufferCommands(bufferCommands)) {
        return Promise.reject(invalidBufferCommandError())
    }
    if(!validateBufferMaxEntries(bufferMaxEntries)) {
        return Promise.reject(invalidBufferMaxEntriesError())
    }

    const connectionObject = createConnectionObject(bufferCommands, bufferMaxEntries)

    if (!currentConnection) {
        return createConnection(createConn, URI, connectionObject)
    }
    return Promise.resolve(currentConnection)
})




module.exports = {
    invalidBufferCommandError,
    invalidBufferMaxEntriesError,
    invalidMongoDbURIConStringError,
    failedToCreateMongoDBConnectionError,
    validateBufferCommands,
    validateBufferMaxEntries,
    validateConnectionString,
    createConnectionObject,
    createConnection,
    getConnectionSafe,
    getConnection: () => {
        if(currentConnection == null) {
            currentConnection = getConnectionSafe(currentConnection, mongoose.createConnection)
        }
        return getConnectionSafe(getConnectionSafe(currentConnection, mongoose.createConnection))
    }
}