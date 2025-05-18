import { io } from "socket.io-client";

export const initSocket = (username = "Guest") => {
  return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
    transports: ["websocket"],
    query: { username }, // 👈 Pass username in query
  });
};
