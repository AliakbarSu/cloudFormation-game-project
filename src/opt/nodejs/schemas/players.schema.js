const mongoose = require('mongoose');
const types = mongoose.Schema.Types;

module.exports = {
    pid: types.ObjectId,
    online: Boolean,
    level: {type: Number, default: 1},
    email: String,
    connectionId: String,
    category: {type: String, default: "General"},
    language: {type: String, default: "English"},
    last_connected: String,
    wins: {type: Number, default: 0},
    losses: {type: Number, default: 0},
    points: [{
        redeemable: {type: Boolean, default: false},
        value: {type: Number, default: 1}
    }],
    status: {
        type: String, 
        default: "INACTIVE", 
        enum: ['INACTIVE', 'READY', 'PLAYING'],
        uppercase: true
    },
    location: {type: {type: String, default: "Point"}, coordinates: {type: Array, default: [23.244, -22.3232]}}
}

