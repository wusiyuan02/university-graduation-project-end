let express = require("express");

let mongoose = require("mongoose");
module.exports = new mongoose.Schema({
  sender: {
    type: String,
  },
  receiver: {
    type: String,
  },
  requestTime: {
    type: String,
  },
});
