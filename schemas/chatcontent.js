let express = require('express');

let mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    sendUsername: {
        type: String
    },
    receiverUsername: {
        type: String
    },
    sendTime: {
        type: String,
    },
    content: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
});