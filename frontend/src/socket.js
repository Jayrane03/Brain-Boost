import { io } from "socket.io-client";

export const initSocket = (username = "Guest") => {
  return io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    transports: ["websocket"],
    query: { username }, // 👈 Pass username in query
  });
};
