// api/models/comment.js

const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  post_id: mongoose.Schema.Types.ObjectId,
  message: String,
  user_id: mongoose.Schema.Types.ObjectId,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("comments", CommentSchema);

module.exports = Comment;
