// api/routes/users.js

const express = require("express");

const UsersController = require("../controllers/users");

const multer = require("../middleware/fileUpload");

const router = express.Router();

router.post("/", multer.single("profile_pic"), UsersController.create);
router.get("/:id", UsersController.getUser);
router.put("/:id", multer.single("profile_pic"), UsersController.updateUser);
router.get("/search/:full_name", UsersController.getUserByFullName);

module.exports = router;
