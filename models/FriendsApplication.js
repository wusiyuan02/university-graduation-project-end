let mongoose = require('mongoose');
let friendsApplicationSchema = require('../schemas/friendsApplication');

module.exports = mongoose.model('FriendsApplication', friendsApplicationSchema);