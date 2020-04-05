// set up a command function
var getDbStats = function(db, callback) {
    db.command({'use': "testDatabase"},
    function(err, results) {
      console.log(results);
      callback();
  }
);
};

// use the function
var MongoClient = require('mongodb').MongoClient
, assert = require('assert');

// Connection URL
var url = 'mongodb+srv://admin:123456khan@cluster0-xebut.mongodb.net/test?retryWrites=true&w=majority';
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    let database = client.db('databaseName');
    console.log("Connected correctly to server");
    getDbStats(database, function() {
        client.close();
    });
});