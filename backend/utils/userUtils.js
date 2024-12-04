const User = require("../models/UserPayment");

const updateUserStatus = async (userId, status) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.status = status;
      await user.save();
      console.log(`User status updated to ${status}`);
    }
  } catch (error) {
    console.error("Error updating user status: ", error);
  }
};

module.exports = { updateUserStatus };
