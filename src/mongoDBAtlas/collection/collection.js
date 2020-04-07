let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}

const MongoClient = require('mongodb');

exports.createCollection = async (event) => {
    console.log("Creating collection.")
    if(!event || !event.collection || !event.url || !event.database) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }
    console.log(event)
    const url = `${event.url}`
    const client = new MongoClient.MongoClient(url);
    await client.connect();
    console.log("Connected correctly to server");
  
    const db = client.db(event.database);
    await db.createCollection(event.collection, event.config)
    return {name: event.collection}
}

exports.updateCollection = async (event) => {
    console.log("Updating collection.")
    if(!event || !event.collection || !event.url || !event.database) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const url = `${event.url}`
    const client = new MongoClient.MongoClient(url);

    await client.connect();
    console.log("Connected correctly to server");
  
    const db = client.db(event.database);
    await db.createCollection(event.collection, event.config)
    return {name: event.collection}
}

exports.deleteCollection = async (event) => {
    console.log("Deleting collection")
    if(!event || !event.collection || !event.url || !event.database) {
        console.log("The following arguments was invalid: ", event)
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const url = `${event.url}`
    const client = new MongoClient.MongoClient(url);

    await client.connect();
    console.log("Connected correctly to server");
  
    const db = client.db(event.database);
    await db.dropCollection(event.collection)
    return {name: event.collection}
}