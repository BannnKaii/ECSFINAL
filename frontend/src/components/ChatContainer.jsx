import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react"; // ADDED: useState import for dropdown state
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Languages } from "lucide-react";
import axiosInstance from "../lib/axios";
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
  const [translations, setTranslations] = useState({}); // key: message id, value: translated text
  const [loadingTranslations, setLoadingTranslations] = useState({}); // key: message id, value: boolean
  
  const [selectedImage, setSelectedImage] = useState(null);
  const openImageFullscreen = (imageUrl) => {
    setSelectedImage(imageUrl);
  };
  
  const closeImageFullscreen = () => {
    setSelectedImage(null);
  };
  
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
  
  // Function to call the backend translation endpoint using axiosInstance
  const handleTranslate = async (messageId, text) => {
    // Prevent multiple requests for the same message
    if (loadingTranslations[messageId]) return;
    setLoadingTranslations((prev) => ({ ...prev, [messageId]: true }));

    try {
      // Make a POST request using axiosInstance
      const { data } = await axiosInstance.post("/translate", {
        text,
        target: "ml", // Malayalam target language code
      });
      setTranslations((prev) => ({ ...prev, [messageId]: data.translatedText }));
    } catch (err) {
      console.error("Translation request failed:", err);
    } finally {
      setLoadingTranslations((prev) => ({ ...prev, [messageId]: false }));
    }
  };

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
                className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                onClick={() => openImageFullscreen(message.image)}
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
              
              
              {message.text && (
                <>
                  <p>{message.text}</p>
                  {/* Display translated text if available */}
                  {translations[message._id] && (
                    <p className="mt-2 text-green-600">
                      {translations[message._id]}
                    </p>
                  )}
                  {/* Button to trigger translation */}
                  <button
                    onClick={() => handleTranslate(message._id, message.text)}
                    className="btn btn-ghost btn-xs p-1"
                    disabled={loadingTranslations[message._id]}
                  >
                    {loadingTranslations[message._id] ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Languages className="size-4" />
                    )}
                  </button>
                </>
              )}

                {selectedImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                  onClick={closeImageFullscreen}
                >
                  <div className="relative">
                    <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-screen rounded-md" />
                    <button className="absolute top-4 center text-black text-2xl" onClick={closeImageFullscreen}>
                      ✕
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
