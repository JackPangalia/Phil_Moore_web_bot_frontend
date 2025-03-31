// hooks/useChat.js - MODIFIED VERSION
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

  // Define all available suggestions
  const ALL_SUGGESTIONS = [
    "I'm looking to sell my house! Can you help?",
    "Show me homes for sale in Burnaby.",
    "Can you explain the home-buying process?",
    "What are the current mortgage rates?",
    "How do I prepare my home for selling?",
    "What documents do I need to buy a house?",
    "Tell me about the real estate market in Vancouver",
    "What services do you offer for sellers?",
    "How long does it take to close on a house?",
    "What are the closing costs when buying a home?",
  ];

  // Track used suggestions
  const [usedSuggestions, setUsedSuggestions] = useState([]);
  
  // Initial message
  const INITIAL_MESSAGE =
    "Welcome to the Phil Moore & Doris Gee Real Estate Chatbot! 🏡✨ I'm here to help with all your real estate questions—whether you're looking for listings, market trends, or buying and selling advice. Ask me anything!";
  
  // Initialize suggestions state with the first 3 suggestions
  const [suggestions, setSuggestions] = useState(ALL_SUGGESTIONS.slice(0, 3));

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

  // Update suggestions when a response is complete
  useEffect(() => {
    // Only change suggestions when there are complete messages AND not loading
    if (messages.length > 0 && messages[messages.length - 1].complete && !isLoading) {
      rotateSuggestions();
    }
  }, [messages, isLoading]);

  // Function to rotate and update suggestions
  const rotateSuggestions = useCallback(() => {
    // Get suggestions that haven't been used recently
    const availableSuggestions = ALL_SUGGESTIONS.filter(
      suggestion => !usedSuggestions.includes(suggestion)
    );
    
    // If we have fewer than 3 available suggestions, reset the used suggestions
    // but keep the most recently used ones out of the rotation
    let newSuggestions = [];
    if (availableSuggestions.length < 3) {
      const recentlyUsed = usedSuggestions.slice(-3);
      const resetAvailable = ALL_SUGGESTIONS.filter(
        suggestion => !recentlyUsed.includes(suggestion)
      );
      
      // Pick random suggestions from the reset pool
      newSuggestions = getRandomSuggestions(resetAvailable, 3);
      setUsedSuggestions(recentlyUsed);
    } else {
      // Pick random suggestions from available ones
      newSuggestions = getRandomSuggestions(availableSuggestions, 3);
    }
    
    setSuggestions(newSuggestions);
  }, [usedSuggestions]);

  // Helper function to get random suggestions
  const getRandomSuggestions = (pool, count) => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

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
    setIsLoading(false); // Ensure isLoading is true during text deltas
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
    setIsLoading(false); // Set isLoading to false when response is complete
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
    // We'll let the useEffect handle rotating suggestions after isLoading changes
  }

  function handleError(error) {
    console.error("Socket error:", error);
    setIsLoading(false); // Make sure to set isLoading to false on error
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
      // Reset used suggestions when chat is cleared
      setUsedSuggestions([]);

      if (reason === "session_timeout") {
        removeItem("chatSessionId");
        setShowSessionExpiredModal(true);
      }
    }
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
      setIsLoading(true); // Set loading to true when sending message
      // Clear suggestions while waiting for response
      setSuggestions([]); 

      socket.emit("send_prompt", { prompt: messageToSend });
      setInputMessage("");
    },
    [inputMessage, socket]
  );

  // Modified handleSuggestionClick to track used suggestions
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      // Add clicked suggestion to used suggestions list
      setUsedSuggestions(prev => [...prev, suggestion]);
      
      // Send the suggestion as a message
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
    // Reset used suggestions
    setUsedSuggestions([]);
  }, [socket, sessionId]);

  const handleDismissSessionExpiredModal = useCallback(() => {
    setShowSessionExpiredModal(false);
  }, []);

  return {
    messages,
    // Only return suggestions if not loading
    suggestions: isLoading ? [] : suggestions,
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