import { X, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";


const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser, blockUser, unblockUser, onlineUsers } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const { reportUser } = useAuthStore();
  if (!selectedUser) return null; // Prevents rendering if no user is selected

  // Ensure authUser & blockedUsers exist before checking includes()
  const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id) || false;

  const handleReportUser = async () => {
    if (!reportReason) {
      toast.error("Please select a reason for reporting.");
      return;
    }
  
    await reportUser(selectedUser._id, reportReason, reportDescription); // Call reportUser function
    setReportModalOpen(false);
    setReportReason("");
    setReportDescription("");
  };


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="p-2.5 border-b border-base-300 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <Link to={"/selecteduserprofile"}>
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </Link>
        </div>

        {/* Three-dot menu and close button */}
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical />
          </button>
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div ref={menuRef} className="absolute top-12 right-2 bg-white shadow-md rounded p-2 z-50">

            {isBlocked ? (
              <button
                onClick={() => {
                  unblockUser(selectedUser._id);
                  setMenuOpen(false);
                }}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Unblock User
              </button>
            ) : (
              <button
                onClick={() => {
                  blockUser(selectedUser._id);
                  setMenuOpen(false);
                }}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Block User
              </button>
            )}


             <button onClick={() => setReportModalOpen(true)} className="block px-4 py-2 hover:bg-gray-100">
              Report User
            </button>

            <button
              onClick={() => setMenuOpen(false)} // Close only the menu
              className="block px-4 py-2 hover:bg-gray-100"
            >
              Close Menu
            </button>
          </div>
        )}
      </div>

     {/* Report Modal */}
     {reportModalOpen && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-bold mb-4">Report User</h2>
            <label className="block mb-2">Reason:</label>
            <select className="w-full p-2 border rounded mb-4" onChange={(e) => setReportReason(e.target.value)}>
              <option value="">Select a reason</option>
              <option value="Spam">Spam</option>
              <option value="Harassment">Harassment</option>
              <option value="Sensitive Content">Sensitive Content</option>
              <option value="Other">Other</option>
            </select>
            <label className="block mb-2">Description (optional):</label>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows="3"
              placeholder="Provide more details..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button onClick={() => setReportModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={handleReportUser} className="px-4 py-2 bg-red-500 text-white rounded">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>



    
  );
};

export default ChatHeader;
