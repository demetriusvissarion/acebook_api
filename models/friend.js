// api/models/friend.js

const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Friend = mongoose.model("friends", FriendSchema);

module.exports = Friend;
