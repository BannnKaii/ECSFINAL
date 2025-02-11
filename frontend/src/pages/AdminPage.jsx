// AdminDashboard.jsx
import { useState } from "react";
import AdminReports from "./AdminReports";
import ManageUsers from "./ManageUsers";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("reports"); // "reports" or "users"
  
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4"> 
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <ul>
          <li 
            className={`mb-4 cursor-pointer ${activeTab === "reports" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </li>
          <li 
            className={`mb-4 cursor-pointer ${activeTab === "users" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Manage Users
          </li>
        </ul>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        {activeTab === "reports" && <AdminReports />}
        {activeTab === "users" && <ManageUsers />}
      </div>
    </div>
  );
};

export default AdminPage;
