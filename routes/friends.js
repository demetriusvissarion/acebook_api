// api/routes/friends.js

const express = require("express");
const router = express.Router();

const FriendsController = require("../controllers/friends.js");

router.get("/:id/friendStatus", FriendsController.getFriendStatus);

router.get("/:id/allfriends", FriendsController.getAllFriendsByUserId);

router.post("/:id/befriend", FriendsController.befriend);

router.post("/:id/unfriend", FriendsController.unfriend);

module.exports = router;
