// api/controllers/posts.js

const Post = require("../models/post");
const { generateToken } = require("../lib/token");
const mongoose = require("mongoose");

const getAllPosts = async (req, res) => {
  try {
    const pageNumber = req.params.loadCycle || 1;
    const postLoadLimit = 3;
    const pageLimit = pageNumber * postLoadLimit;

    const totalPosts = await Post.countDocuments();

    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          createdAt: {
            $ifNull: ["$createdAt", new Date("2024-02-01T16:05:55.034+00:00")],
          }, // If createdAt is null, set it to the current date
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: pageLimit, // Limit the number of posts per page
      },
      {
        $project: {
          _id: 1,
          message: 1,
          full_name: "$userDetails.full_name",
          profile_pic: "$userDetails.profile_pic",
          image: 1,
          createdAt: 1,
          user_id: 1,
        },
      },
    ]);
    const token = generateToken(req.user_id);
    res.status(200).json({ posts, token, totalPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPostsByUser = async (req, res) => {
  let user_id = req.params.id;

  try {
    const posts = await Post.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id), // Convert user_id to ObjectId if it's a string
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          message: 1,
          full_name: "$userDetails.full_name",
          profile_pic: "$userDetails.profile_pic",
          image: 1,
          user_id: 1,
        },
      },
    ]);
    const token = generateToken(req.user_id);
    res.status(200).json({ posts, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createPost = async (req, res) => {
  try {
    let image = "";

    if (req.file) {
      image =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/" +
        req.file.filename;
    }

    const { message, user_id } = req.body;
    // const image = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename;

    const post = new Post({ message, user_id, image });
    await post.save();

    const newToken = generateToken(req.user_id);
    res.status(201).json({ message: "OK", token: newToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  console.log("Trying to delete: " + id);
  try {
    const deletedPost = await Post.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    res.json({
      message: "Post has been deleted successfully",
      deletedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error: " + error });
  }
};

const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const postText = req.body.post;

    console.log(postText);
    console.log(postId);

    if (!postId) {
      return res
        .status(400)
        .json({ message: "Post ID is required to edit a Post!" });
    }

    if (!postText) {
      return res
        .status(400)
        .json({ message: "Updated post is required to edit!" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { message: postText },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(400).json({ message: "`Post not found!" });
    }

    res
      .status(200)
      .json({ message: "Post Updated Successfully!", updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const PostsController = {
  getAllPosts: getAllPosts,
  createPost: createPost,
  getPostsByUser: getPostsByUser,
  deletePost: deletePost,
  editPost: editPost,
};

module.exports = PostsController;
