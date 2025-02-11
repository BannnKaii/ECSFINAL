import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    const { authUser } = useAuthStore.getState();
  
    // ✅ Fix: Ensure blockedUsers is always an array
    const blockedUsers = Array.isArray(authUser?.blockedUsers) ? authUser.blockedUsers : [];
  
    if (blockedUsers.includes(userId)) {
      toast.error("You have blocked this user.");
      return;
    }
  
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages.");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    console.log("auth",authUser)

    if (!authUser?.blockedUsers || !Array.isArray(authUser.blockedUsers)) {
      console.warn("Blocked users data is missing or not an array.");
      return
    }

    if (authUser.blockedUsers.includes(selectedUser._id)) {
      toast.error("You have blocked this user.");
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(messageData).forEach((key) => {
        if (messageData[key]) {
          if (key === "file" && messageData[key].data) {
            formData.append("file", messageData[key].data);
            formData.append("fileName", messageData[key].name);
          } else {
            formData.append(key, messageData[key]);
          }
        }
      });

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData
      );

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const { authUser, socket } = useAuthStore.getState();

    socket.on("newMessage", (newMessage) => {
      const isMessageRelevant =
        newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;

      if (!authUser?.blockedUsers || !Array.isArray(authUser.blockedUsers)) {
        console.warn("Blocked users data is missing or not an array.");
        return;
      }

      if (authUser.blockedUsers.includes(newMessage.senderId)) {
        console.warn("Blocked user message ignored:", newMessage);
        return;
      }

      if (isMessageRelevant) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });

    // ✅ Unsubscribe from old messages & resubscribe to new ones
    get().unsubscribeFromMessages();
    get().subscribeToMessages();
  },
}));
 