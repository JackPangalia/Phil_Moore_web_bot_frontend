// hooks/useChat.js
import { useState, useEffect, useRef, useCallback } from "react";
import useSocketConnection from "./useSocketConnection";
import useLocalStorage from "./useLocalStorage";

/**
 * useChat custom hook manages the state and logic for a chat application, including
 * message handling, socket communication, and session management.
 *
 * @returns {object} An object containing chat state and handler functions.
 */
const useChat = () => {
  // State management with custom hooks
  const { getItem, setItem, removeItem } = useLocalStorage();

  // Message state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define initial suggestions
  //! Replace with your own initial suggestions
  const INITAL_SUGGESTIONS = [
    "What AI solutions do you offer?",
    "How does your chatbot development process work?",
    "Can you explain how AI agents improve business efficiency?",
  ];

  //! Replace with your own initial message
  const INITIAL_MESSAGE =
    "👋 Welcome to Centonis! We're experts in AI consulting, chatbot development, and AI agents. Ask me anything about our services, AI solutions, or how we can help your business. I'm here to assist you!";
  // Initialize suggestions state with default suggestions
  const [suggestions, setSuggestions] = useState(INITAL_SUGGESTIONS);

  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // References
  const messagesEndRef = useRef(null);

  // Initialize socket connection with session handling
  const { socket, sessionId } = useSocketConnection({
    onSessionCreated: handleSessionCreated,
    onSessionResumed: handleSessionResumed,
    onTextDelta: handleTextDelta,
    onResponseComplete: handleResponseComplete,
    onError: handleError,
    onClearChat: handleClearChatEvent,
    onSuggestions: handleSuggestions,
  });

  // Load saved messages on initial render
  useEffect(() => {
    const savedMessages = getItem("chatMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const completeMessages = parsedMessages.filter((msg) => msg.complete);
        // If there are no complete messages, add the welcome message
        if (completeMessages.length === 0) {
          completeMessages.push({
            messageType: "ai",
            message: INITIAL_MESSAGE,
            complete: true,
          });
        }
        setMessages(completeMessages);
        setItem("chatMessages", JSON.stringify(completeMessages));
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        removeItem("chatMessages");
      }
    } else {
      // No saved messages, so initialize with a welcome message
      const initialMessages = [
        {
          messageType: "ai",
          message: INITIAL_MESSAGE,
          complete: true,
        },
      ];
      setMessages(initialMessages);
      setItem("chatMessages", JSON.stringify(initialMessages));
    }
  }, []);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Event handlers
  function handleSessionCreated(data) {
    setSessionId(data.sessionId);
    setItem("chatSessionId", data.sessionId);

    if (data.wasCleared || data.wasExpired) {
      setMessages([]);
      removeItem("chatMessages");

      if (data.wasExpired) {
        setShowSessionExpiredModal(true);
      }
    }
  }

  function handleSessionResumed(data) {
    setSessionId(data.sessionId);
  }

  function handleTextDelta({ textDelta, snapshot }) {
    setIsLoading(false);
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (
        lastMessage &&
        lastMessage.messageType === "ai" &&
        !lastMessage.complete
      ) {
        const updatedMessages = [...prev];
        updatedMessages[prev.length - 1] = {
          ...lastMessage,
          message: lastMessage.message + textDelta.value,
        };
        return updatedMessages;
      } else {
        return [
          ...prev,
          {
            messageType: "ai",
            message: textDelta.value,
            complete: false,
          },
        ];
      }
    });
  }

  function handleResponseComplete() {
    setIsLoading(false);
    setMessages((prev) => {
      const updatedMessages = [...prev];
      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          complete: true,
        };
      }
      return updatedMessages;
    });
  }

  function handleError(error) {
    console.error("Socket error:", error);
    setIsLoading(false);
    setError(error.message || "An error occurred");

    if (error.code === "SESSION_INVALID") {
      removeItem("chatSessionId");
      removeItem("chatMessages");
      setMessages([]);

      setTimeout(() => {
        socket?.emit("init_session");
      }, 1000);
    }

    setTimeout(() => setError(null), 5000);
  }

  function handleClearChatEvent({ sessionId: clearedSessionId, reason }) {
    if (clearedSessionId === sessionId) {
      setMessages([]);
      setIsLoading(false);
      removeItem("chatMessages");

      if (reason === "session_timeout") {
        removeItem("chatSessionId");
        setShowSessionExpiredModal(true);
      }
    }
  }

  // This function handles suggestions coming from the server.
  // If new suggestions are provided, they will override the initial suggestions.
  function handleSuggestions(data) {
    setSuggestions(data.suggestions);
  }

  // User interactions
  // Modified handleSendMessage to accept an optional customMessage parameter.
  const handleSendMessage = useCallback(
    (e, customMessage) => {
      if (e && e.preventDefault) e.preventDefault();
      const messageToSend =
        customMessage !== undefined ? customMessage : inputMessage;
      if (!messageToSend.trim() || !socket) return;

      const newMessage = {
        messageType: "user",
        message: messageToSend,
        complete: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);

      socket.emit("send_prompt", { prompt: messageToSend });
      setInputMessage("");
      setSuggestions([]);
    },
    [inputMessage, socket]
  );

  // Modified handleSuggestionClick to immediately send the suggestion.
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      handleSendMessage(null, suggestion);
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  const handleClearChat = useCallback(() => {
    if (!socket || !sessionId) return;
    socket.emit("clear_chat", { sessionId });
  }, [socket, sessionId]);

  const handleDismissSessionExpiredModal = useCallback(() => {
    setShowSessionExpiredModal(false);
  }, []);

  return {
    messages,
    suggestions,
    inputMessage,
    isLoading,
    error,
    sessionId,
    showSessionExpiredModal,
    messagesEndRef,
    handleSendMessage,
    handleInputChange,
    handleClearChat,
    handleSuggestionClick,
    handleDismissSessionExpiredModal,
  };
};

export default useChat;