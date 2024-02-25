// api/routes/likes.js

const express = require("express");
const router = express.Router();

const LikesController = require("../controllers/likes");

router.get("/:postId", LikesController.getAllLikesByPostId);
router.post("/toggle",LikesController.addLikesToPostByPostIdUserId);

module.exports = router;