import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react"; // ADDED: useState import for dropdown state
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage, // ADDED: deletion function from store
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // ADDED: State to manage which message's dropdown is open
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ADDED: Toggle function for dropdown menu
  const toggleDropdown = (messageId) => {
    setDropdownOpen(dropdownOpen === messageId ? null : messageId);
  };

  // ADDED: Function to handle deletion of a message and close the dropdown
  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
    setDropdownOpen(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col relative">
              {/* ADDED: DaisyUI dropdown for delete message, positioned to the left with extra spacing */}
              {message.senderId === authUser._id && (
                <div className="dropdown dropdown-start absolute top-0 -left-10">
                  <button
                    tabIndex={0}
                    className="btn btn-ghost btn-circle"
                    onClick={() => toggleDropdown(message._id)}
                  >
                    <div className="w-6">⋮</div>
                  </button>
                  {dropdownOpen === message._id && (
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-red-200 rounded-box w-32 z-50"
                    >
                      <li>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="font-bold text-black" // ADDED: Bold and black text styling
                        >
                          Delete Message
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.file && (
                <a
                  href={`${message.file}?fl_attachment=true`} // Cloudinary attachment flag
                  download={message.fileName} // Correctly formatted file name
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline break-all mb-2"
                >
                  {message.fileName || "Download File"}
                </a>
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
