// hooks/useSocketConnection.js
import { useState, useEffect } from "react";
import io from "socket.io-client";
import useLocalStorage from "./useLocalStorage";

/**
 * useSocketConnection custom hook manages a Socket.IO connection and handles
 * various socket events for a chat application.
 *
 * @param {object} props - An object containing callback functions for socket events.
 * @param {function} props.onSessionCreated - Callback for 'session_created' event.
 * @param {function} props.onSessionResumed - Callback for 'session_resumed' event.
 * @param {function} props.onTextDelta - Callback for 'textDelta' event.
 * @param {function} props.onResponseComplete - Callback for 'responseComplete' event.
 * @param {function} props.onError - Callback for 'error' event.
 * @param {function} props.onClearChat - Callback for 'clear_chat' event.
 * @param {function} props.onSuggestions - Callback for 'suggestions' event.
 * @returns {object} An object containing the socket instance, sessionId, and setSessionId function.
 */
const useSocketConnection = ({
  onSessionCreated,
  onSessionResumed,
  onTextDelta,
  onResponseComplete,
  onError,
  onClearChat,
  onSuggestions,
}) => {
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const { getItem } = useLocalStorage();

  useEffect(() => {
    console.log("Connecting to Socket.IO server...");
    const newSocket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Attempt to resume a previous session or initialize a new one
    const savedSessionId = getItem("chatSessionId");
    if (savedSessionId) {
      newSocket.emit("resume_session", { sessionId: savedSessionId });
    } else {
      newSocket.emit("init_session");
    }

    // Event listeners
    newSocket.on("session_created", (data) => {
      setSessionId(data.sessionId);
      onSessionCreated && onSessionCreated(data);
    });

    newSocket.on("session_resumed", (data) => {
      setSessionId(data.sessionId);
      onSessionResumed && onSessionResumed(data);
    });

    newSocket.on("textDelta", (data) => {
      onTextDelta && onTextDelta(data);
    });

    newSocket.on("responseComplete", () => {
      onResponseComplete && onResponseComplete();
    });

    newSocket.on("error", (error) => {
      onError && onError(error);
    });

    newSocket.on("clear_chat", (data) => {
      onClearChat && onClearChat(data);
    });

    newSocket.on("suggestions", (data) => {
      onSuggestions && onSuggestions(data);
    });

    newSocket.on("connect", () => {
      const currentSessionId = getItem("chatSessionId");
      if (currentSessionId) {
        newSocket.emit("resume_session", { sessionId: currentSessionId });
      } else {
        newSocket.emit("init_session");
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, sessionId, setSessionId };
};

export default useSocketConnection;