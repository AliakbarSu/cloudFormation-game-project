let resourcesPath = "../../../src/opt/nodejs/";
if(!process.env['DEV']) {
    resourcesPath = "/opt/nodejs/"
}

const MongoClient = require('mongodb');

exports.createCollection = async (event) => {
    if(!event || !event.collection || !event.url || !event.database) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const url = `${event.url}/${event.database}`
    const client = new MongoClient.MongoClient(url);
    await client.connect();
    console.log("Connected correctly to server");
  
    const db = client.db(event.database);
    const collection = await db.createCollection(event.collection, event.config)
    return {name: event.collection}
}

exports.updateCollection = async (event) => {
    if(!event || !event.collection || !event.url || !event.database) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const url = `${event.url}/${event.database}`
    const client = new MongoClient.MongoClient(url);

    await client.connect();
    console.log("Connected correctly to server");
  
    const db = client.db(event.database);
    const collection = await db.createCollection(event.collection, event.config)
    return {name: event.collection}
}

exports.deleteCollection = async (event) => {
    if(!event || !event.collection || !event.url || !event.database) {
        return Promise.reject(new Error("INVALID_ARGUMENTS_PROVIDED"))
    }

    const url = `${event.url}/${event.database}`
    const client = new MongoClient.MongoClient(url);

    await client.connect();
    console.log("Connected correctly to server");
  
    const db = client.db(event.database);
    const collection = await db.dropCollection(event.collection)
    return {name: event.collection}
}