import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["Pending", "Reviewed"], default: "Pending" },
    // Snapshot fields for reported user:
    reportedUserName: { type: String },
    reportedUserEmail: { type: String },
    reportedUserSemester: { type: String },
    reportedUserCourse: { type: String },
    // Snapshot fields for reporter:
    reporterName: { type: String },
    reporterEmail: { type: String },
    reporterSemester: { type: String },
    reporterCourse: { type: String },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
