const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  profile_pic: {
    type: String,
    required: false,
  },
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  about_me: { type: String, required: false },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
