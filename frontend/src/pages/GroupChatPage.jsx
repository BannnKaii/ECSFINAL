import React, { useEffect, useRef } from "react";
import { useGroupChatStore } from "../store/useGroupChatStore";
import { useAuthStore } from "../store/useAuthStore";
import GroupChatHeader from "../components/GroupChatHeader";
import MessageInput from "../components/MessageInput";
import { formatMessageTime } from "../lib/utils";

const GroupChatPage = () => {
  const { authUser } = useAuthStore();
  const {
    groupMessages,
    isLoading,
    getGroupMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    sendGroupMessage,
  } = useGroupChatStore();
  const messageEndRef = useRef(null);

  // Fetch messages and subscribe to socket events on mount
  useEffect(() => {
    if (authUser) {
      getGroupMessages();
      subscribeToGroupMessages();
    }
    return () => {
      unsubscribeFromGroupMessages();
    };
  }, [authUser, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current && groupMessages.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen">
        {/* ✅ Sticky Chat Header */}
        <div className="sticky top-16 z-10 bg-base-100 shadow-md">
          <GroupChatHeader />
        </div>
        <div className="flex-1 p-4 overflow-y-auto pt-20">Loading messages...</div>
        {/* ✅ Fixed Message Input at Bottom */}
        <div className="sticky bottom-0 bg-base-100 shadow-md">
          <MessageInput sendMessage={sendGroupMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* ✅ Sticky Chat Header */}
      <div className="sticky top-16 z-10 bg-base-100 shadow-md">
        <GroupChatHeader />
      </div>

      {/* ✅ Scrollable Messages with Padding to Prevent Overlap */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-20">
        {groupMessages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId._id === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="w-10 h-10 rounded-full border">
                <img
                  src={
                    message.senderId._id === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : message.senderId.profilePic || "/avatar.png"
                  }
                  alt="profile"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <span className="font-bold">
                {message.senderId.fullName || "Anonymous"}
              </span>
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.file && (
                <a
                  href={`${message.file}?fl_attachment=true`}
                  download={message.fileName}
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
        <div ref={messageEndRef} />
      </div>

      {/* ✅ Fixed Message Input at Bottom */}
      <div className="sticky bottom-0 bg-base-100 shadow-md">
        <MessageInput sendMessage={sendGroupMessage} />
      </div>
    </div>
  );
};

export default GroupChatPage;
