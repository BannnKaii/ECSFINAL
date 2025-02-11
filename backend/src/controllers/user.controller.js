import User from "../models/user.model.js";

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUser = await User.findById(req.user._id);

    if (!loggedInUser) return res.status(404).json({ message: "User not found" });

    if (!loggedInUser.blockedUsers.includes(userId)) {
      loggedInUser.blockedUsers.push(userId);
      await loggedInUser.save();
    }
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUser = await User.findById(req.user._id);

    if (!loggedInUser) return res.status(404).json({ message: "User not found" });

    // ✅ Ensure blockedUsers is updated correctly
    loggedInUser.blockedUsers = loggedInUser.blockedUsers.filter((id) => id.toString() !== userId);
    await loggedInUser.save();

    // ✅ Send updated blockedUsers list to frontend
    res.status(200).json({ 
      message: "User unblocked successfully", 
      blockedUsers: loggedInUser.blockedUsers 
    });
  } catch (error) {
    console.error("Error in unblockUser:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

