// api/controllers/likes.js

const Post = require("../models/post");
const { generateToken } = require("../lib/token");
const Comment = require("../models/comment");

const getAllLikesByPostId = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user_id;
    // Find the post by postId
    const post = await Post.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Return the number of likes
    const numberOfLikes = post.likes.length;
    const userLiked = post.likes.includes(userId);

    res
      .status(200)
      .json({ numberOfLikes: numberOfLikes, userLiked: userLiked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addLikesToPostByPostIdUserId = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.user_id;
    //console.log(userId);
    // Find the post by postId
    const post = await Post.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Determine if the user has already liked the post
    if (post.likes.includes(userId)) {
      // User already liked the post, so remove the like
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    } else {
      // User hasn't liked the post, so add the like
      await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
    }

    res.status(200).json({ message: "Like status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//
//
// Adding new section which is a copy of the above but for comment likes
//
//

const getAllLikesByCommentId = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user_id;
    //console.log(userId);
    // Find the comment by commentId
    const comment = await Comment.findById(commentId);

    // Check if the comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Return the number of likes
    const numberOfLikes = comment.likes.length;
    const userLiked = comment.likes.includes(userId);

    res
      .status(200)
      .json({ numberOfLikes: numberOfLikes, userLiked: userLiked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addLikesToCommentByCommentIdUserId = async (req, res) => {
  try {
    const commentId = req.body.commentId;
    const userId = req.user_id;
    //console.log(userId);
    // Find the comment by Id
    const comment = await Comment.findById(commentId);

    // Check if the comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Determine if the user has already liked the comment
    if (comment.likes.includes(userId)) {
      // User already liked the comment, so remove the like
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
    } else {
      // User hasn't liked the comment, so add the like
      await Comment.findByIdAndUpdate(commentId, {
        $addToSet: { likes: userId },
      });
    }

    res.status(200).json({ message: "Like status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const LikesController = {
  getAllLikesByPostId: getAllLikesByPostId,
  addLikesToPostByPostIdUserId: addLikesToPostByPostIdUserId,
  getAllLikesByCommentId: getAllLikesByCommentId,
  addLikesToCommentByCommentIdUserId: addLikesToCommentByCommentIdUserId,
};

module.exports = LikesController;
