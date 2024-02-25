const User = require("../models/user");
const { generateToken } = require("../lib/token");
const Post = require("../models/post");
const Comment = require("../models/comment");
const mongoose = require("mongoose");

const getUser = async (req, res) => {
  try {
    const token = generateToken(req.params.id);
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      console.log(req.params.id);
      console.log("Auth Error: User not found");
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    let profile_pic = "";
    let url = `${req.protocol}://${req.get(
      "host"
    )}/uploads/default_profile_pic.svg.png`;

    if (req.file) {
      profile_pic = req.file.filename;
      url = `${req.protocol}://${req.get("host")}/uploads/${profile_pic}`;
    }

    const { full_name, email, password } = req.body;

    const user = new User({
      profile_pic: url,
      full_name,
      email,
      password,
    });

    const savedUser = await user.save();

    console.log("User created, id:", savedUser._id.toString());
    res
      .status(201)
      .json({ message: "User created successfully", userId: savedUser._id });
  } catch (error) {
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    } else if (error.name === "MongoServerError" && error.code === 11000) {
      console.log("Email already in use");
      res.status(409).json({ message: "Email already in use" });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const getUserByFullName = async (req, res) => {
  try {
    const fullName = req.params.full_name;
    const regexPattern = new RegExp("^" + fullName);
    const users = await User.find(
      { full_name: regexPattern },
      { password: 0, email: 0 }
    );

    if (!users) {
      console.log(req.params.user_id);
      return res.status(401).json({ message: "No users with this name" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const UsersController = {
  create,
  getUser,
  getUserByFullName,
  updateUser: async (req, res) => {
    const { id } = req.params;
    const updatedUserData = req.body; // This contains the user data to update.
    const profilePicPath = req.file ? req.file.path : null; // Get the file path if a file is uploaded.
    console.log(profilePicPath);
    try {
      // If there's a new profile picture, add its path to the update data.
      if (profilePicPath) {
        let url = `${req.protocol}://${req.get("host")}/${profilePicPath}`;

        updatedUserData.profile_pic = url;
      }
      const existingUserWithEmail = await User.findOne({
        email: updatedUserData.email,
        _id: { $ne: id }, // Exclude the current user from the check
      });

      if (existingUserWithEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, {
        new: true,
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
      const deletedUser = await User.deleteOne({
        _id: new mongoose.Types.ObjectId(id),
      });
      const deletedUserPosts = await Post.deleteMany({
        user_id: new mongoose.Types.ObjectId(id),
      });
      const deleteUserComments = await Comment.deleteMany({
        user_id: new mongoose.Types.ObjectId(id),
      });

      // Remove likes made by the user on posts and comments
      await Post.updateMany(
        {},
        { $pull: { likes: new mongoose.Types.ObjectId(id) } }
      );
      await Comment.updateMany(
        {},
        { $pull: { likes: new mongoose.Types.ObjectId(id) } }
      );

      res.json({
        message: "User and their posts have been deleted successfully",
        deletedUserPosts,
        deleteUserComments,
        deletedUser,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = UsersController;
