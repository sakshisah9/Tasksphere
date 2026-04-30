import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    const socketUrl = (import.meta.env.VITE_SOCKET_URL || "http://localhost:5001").replace("localhost:5000", "localhost:5001");
    socket = io(socketUrl, {
      autoConnect: true
    });
  }

  return socket;
}
