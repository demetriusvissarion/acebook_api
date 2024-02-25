// api/routes/comments.js

const express = require("express");
const router = express.Router();

const CommentsController = require("../controllers/comments.js");
const LikesController = require("../controllers/likes");

router.get("/:postId/:loadCycle", CommentsController.getAllCommentsByPostID);
router.post("/", CommentsController.submitComment);
router.delete("/:id", CommentsController.deleteComment);
router.get("/likes/all/:commentId", LikesController.getAllLikesByCommentId);
router.post("/like/toggle", LikesController.addLikesToCommentByCommentIdUserId);
router.put("/:id", CommentsController.editComment);

module.exports = router;
