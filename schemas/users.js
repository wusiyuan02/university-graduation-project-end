let express = require("express");

let mongoose = require("mongoose");

module.exports = new mongoose.Schema({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // 头像
  avatar: {
    type: String,
    default: "http://localhost:3001/public/img/avatar.jpg",
  },
  signature: {
    type: String,
    default: "这人很懒，这是系统帮他写的",
  },
  sex: {
    type: String,
  },
  nickname: {
    type: String,
  },
  birthday: {
    type: String,
  },
  height: {
    type: Number,
  },
  telephone: {
    type: String,
  },
  qqOrWechat: {
    type: String,
  },
  email: {
    type: String,
  },
  maritalStatus: {
    type: String,
  },
  degree: {
    type: String,
  },
  monthlySalary: {
    type: String,
  },
  username: {
    type: String,
  },
  registerTime: {
    type: String,
  },
  personTags: {
    type: [String],
  },
  loveTags: {
    type: [String],
  },
  innerMonologue: {
    type: String,
  },
  friends: {
    type: Array,
  },
});
