    // api/controllers/comments.js

const Comment = require("../models/comment");
const mongoose = require("mongoose");

const getAllCommentsByPostID = async (req, res) => {
  try {
    const pageNumber = req.params.loadCycle || 1;
    const pageLimit = pageNumber * 2;
    //console.log("Page Limit: " + pageLimit);

    const totalComments = await Comment.countDocuments({
      post_id: new mongoose.Types.ObjectId(req.params.postId),
    });
    const comments = await Comment.aggregate([
      {
        $match: {
          post_id: new mongoose.Types.ObjectId(req.params.postId), // Convert user_id to ObjectId because it's a string
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
        $limit: pageLimit, // Limit the number of comments per page
      },
      {
        $project: {
          _id: 1,
          message: 1,
          full_name: "$userDetails.full_name",
          profile_pic: "$userDetails.profile_pic",
          user_id: 1,
          createdAt: 1,
        },
      },
    ]);
    res.status(200).json({ comments, totalComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

    const submitComment = async (req, res) => {
    try {
        const { userId, commentText } = req.body;
        const postId = req.body.postId;

        const comment = new Comment({
        post_id: postId,
        message: commentText,
        user_id: userId,
        });

        comment
        .save()
        .then((comment) => {
            res
            .status(201)
            .json({ message: "Comment created successfully", comment: comment });
        })
        .catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
    };

    const deleteComment = async (req, res) => {
    const { id } = req.params;
    console.log("Trying to delete: " + id);
    try {
        const deletedComment = await Comment.deleteOne({
        _id: new mongoose.Types.ObjectId(id),
        });
        res.json({
        message: "Comment has been deleted successfully",
        deletedComment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error: " + error });
    }
    };


    const editComment = async (req, res) => {
        try {
            const commentId = req.params.id
            const commentText = req.body.comment

            console.log(commentText)
            console.log(commentId)
            
            if (!commentId) {
                return res.status(400).json({ message: "Comment ID is required to edit a comment!"});
            }

            if (!commentText) {
                return res.status(400).json({ message: "Updated comment is required to edit!"})
            }

            const updatedComment = await Comment.findByIdAndUpdate(
                commentId,
                {message: commentText},
                {new: true }
            );

            if (!updatedComment) {
                return res.status(400).json({ message: "`Comment not found!"});
            }
    
            res.status(200).json({ message: "Comment Updated Successfully!", updatedComment});

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error"});
        }

    }

    const CommentsController = {
    submitComment: submitComment,
    getAllCommentsByPostID: getAllCommentsByPostID,
    deleteComment: deleteComment,
    editComment: editComment,
    };

    module.exports = CommentsController;
