const User = require('../models/user');

const createMockUser = async () => {
  const user = new User({
    full_name: 'testuser',
    email: 'testuser@example.com',
    password: "password123"
});

  await user.save();
  return user;
};

// Usage in your test setup
const currentUser = await createMockUser();