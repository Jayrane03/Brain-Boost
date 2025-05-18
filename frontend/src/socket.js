import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    forceNew: true, // ✅ Correct camelCase key
    reconnectionAttempts: Infinity, // ✅ Use numeric Infinity
    timeout: 10000,
    transports: ["websocket"],
  };

  const backendUrl =
    import.meta.env.MODE === "development"
      ? "http://localhost:5001"
      : import.meta.env.VITE_API_URL;

  return io(backendUrl, options);
};
