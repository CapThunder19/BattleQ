"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!SOCKET_URL) {
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        console.log("Connected to game server at", SOCKET_URL);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message, "URL:", SOCKET_URL);
      });

      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        console.log("Disconnected from game server");
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
