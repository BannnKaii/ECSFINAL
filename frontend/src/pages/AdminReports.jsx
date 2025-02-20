import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get("/reports");
      setReports(res.data);
    } catch (error) {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (id) => {
    try {
      await axiosInstance.put(`/reports/${id}/review`);
      toast.success("Report marked as reviewed.");
      setReports(
        reports.map((report) =>
          report._id === id ? { ...report, status: "Reviewed" } : report
        )
      );
    } catch (error) {
      toast.error("Failed to update report status.");
    }
  };

  if (loading) return <p className="p-6">Loading reports...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">User Reports</h2>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Reporter Info</th>
              <th className="border p-2">Reported User Info</th>
              <th className="border p-2">Reason</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="text-center">
                <td className="border p-2 text-left">
                  {report.reporter ? (
                    <>
                      <strong>Name:</strong> {report.reporter.fullName} <br />
                      <strong>Email:</strong> {report.reporter.email} <br />
                      <strong>Course:</strong> {report.reporter.course} <br />
                      <strong>Semester:</strong> {report.reporter.semester}
                    </>
                  ) : (
                    <>
                      <strong>Name:</strong> {report.reporterName || "Deleted User"} <br />
                      <strong>Email:</strong> {report.reporterEmail || "N/A"} <br />
                      <strong>Course:</strong> {report.reporterCourse || "N/A"} <br />
                      <strong>Semester:</strong> {report.reporterSemester || "N/A"}
                    </>
                  )}
                </td>
                <td className="border p-2 text-left">
                  {report.reportedUser ? (
                    <>
                      <strong>Name:</strong> {report.reportedUser.fullName} <br />
                      <strong>Email:</strong> {report.reportedUser.email} <br />
                      <strong>Course:</strong> {report.reportedUser.course} <br />
                      <strong>Semester:</strong> {report.reportedUser.semester}
                    </>
                  ) : (
                    <>
                      <strong>Name:</strong> {report.reportedUserName || "Deleted User"} <br />
                      <strong>Email:</strong> {report.reportedUserEmail || "N/A"} <br />
                      <strong>Course:</strong> {report.reportedUserCourse || "N/A"} <br />
                      <strong>Semester:</strong> {report.reportedUserSemester || "N/A"}
                    </>
                  )}
                </td>
                <td className="border p-2">{report.reason}</td>
                <td className="border p-2">{report.description || "N/A"}</td>
                <td
                  className={`border p-2 ${
                    report.status === "Reviewed" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {report.status}
                </td>
                <td className="border p-2">
                  {report.status === "Pending" && (
                    <button
                      onClick={() => markAsReviewed(report._id)}
                      className="bg-blue-500 text-white px-4 py-1 rounded"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReports;
