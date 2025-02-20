import Report from "../models/report.model.js";
import User from "../models/user.model.js";

export const submitReport = async (req, res) => {
  try {
    const { reportedUser, reason, description } = req.body;
    const reporter = req.user._id;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: "Reported user and reason are required." });
    }

    // Reporter details are available from req.user
    const reporterUser = req.user;
    // Fetch the reported user's document
    const reportedUserDoc = await User.findById(reportedUser);

    // Create the report with snapshot fields
    const report = new Report({
      reportedUser,
      reporter,
      reason,
      description,
      reporterName: reporterUser.fullName,
      reporterEmail: reporterUser.email,
      reporterSemester: reporterUser.semester,
      reporterCourse: reporterUser.course,
      reportedUserName: reportedUserDoc ? reportedUserDoc.fullName : "Unknown User",
      reportedUserEmail: reportedUserDoc ? reportedUserDoc.email : "Unknown",
      reportedUserSemester: reportedUserDoc ? reportedUserDoc.semester : "Unknown",
      reportedUserCourse: reportedUserDoc ? reportedUserDoc.course : "Unknown",
    });

    await report.save();

    res.status(201).json({ message: "Report submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("reportedUser reporter", "fullName email course semester");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markReportAsReviewed = async (req, res) => {
  try {
    const { id } = req.params;
    await Report.findByIdAndUpdate(id, { status: "Reviewed" });
    res.status(200).json({ message: "Report marked as reviewed." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
