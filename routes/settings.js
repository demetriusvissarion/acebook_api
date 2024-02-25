const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");

// Route for updating user's name
router.put("/:id", userController.updateUser);

// Route for updating user data (consider using a more descriptive endpoint, e.g., "/:id/update")
router.put("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const updatedUser = await userController.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for deleting a user
router.delete("/:id", userController.deleteUser);

module.exports = router;
