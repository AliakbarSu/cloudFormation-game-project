const mongoose = require('mongoose');
const types = mongoose.Schema.Types;

function schema() {
    this.pid = types.ObjectId
    this.online = Boolean
    this.level = {type: Number, default: 1}
    this.email = String
    this.connectionId = String
    this.category = {type: String, default: "General"}
    this.language = {type: String, default: "English"}
    this.last_connected = String
    this.wins = {type: Number, default: 0}
    this.losses = {type: Number, default: 0}
    this.points = [{
        redeemable: {type: Boolean, default: false},
        value: {type: Number, default: 1}
    }]
    this.status = {
        type: String, 
        default: "INACTIVE", 
        enum: ['INACTIVE', 'READY', 'PLAYING'],
        uppercase: true
    }
    this.location = {type: {type: String, default: "Point"}, coordinates: {type: Array, default: [23.244, -22.3232]}}
}


module.exports = schema