import Report from "../models/report.model.js";

export const submitReport = async (req, res) => {
  try {
    const { reportedUser, reason, description } = req.body;
    const reporter = req.user._id;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: "Reported user and reason are required." });
    }

    const report = new Report({ reportedUser, reporter, reason, description });
    await report.save();

    res.status(201).json({ message: "Report submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("reportedUser reporter", "fullName email");
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
