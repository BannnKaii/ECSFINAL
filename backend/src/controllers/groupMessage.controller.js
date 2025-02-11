import GroupMessage from "../models/groupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

// Get group messages filtered by the user's course and semester
export const getGroupMessages = async (req, res) => {
  try {
    const { course, semester } = req.user; // from protectRoute
    const messages = await GroupMessage.find({ course, semester })
      .populate("senderId", "fullName profilePic");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a new group message
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, file, fileName } = req.body;
    const { course, semester } = req.user; // filtering info comes from the authenticated user

    let imageUrl = "";
    let fileUrl = "";

    if (image) {
      const imageUploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = imageUploadResponse.secure_url;
    }
    if (file) {
      const fileUploadResponse = await cloudinary.uploader.upload(file, { resource_type: "raw" });
      fileUrl = fileUploadResponse.secure_url;
    }

    const newMessage = new GroupMessage({
      senderId: req.user._id,
      course,
      semester,
      text,
      image: imageUrl,
      file: fileUrl,
      fileName,
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic");
    // Emit to the room corresponding to this course and semester


    const roomName = `${course}-${semester}`;
    
    // ✅ Log the emitted message (for debugging)
    console.log(`📢 Emitting message to room: ${roomName}`, newMessage);


    io.to(`${course}-${semester}`).emit("newGroupMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending group message:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
