import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  const backendUrl =
    import.meta.env.MODE === "development"
      ? "http://localhost:5001" // Localhost backend URL
      : import.meta.env.VITE_API_URL; // Production backend URL

  return io(backendUrl, options);
};
