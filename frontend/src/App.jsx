import { useState, useEffect, useRef } from "react";
import ChatContainer from "./components/ChatContainer";
import SessionExpiredModal from "./components/SessionExpiredModal";
import ErrorBanner from "./components/ErrorBanner";
import Header from "./components/Header";
import useChat from "./hooks/useChat";

/**
 * App component is the main component of the chatbot application.
 * It manages the state and interactions of the chat interface.
 *
 * @component
 */
function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const appContainerRef = useRef(null);

  const {
    messages,
    suggestions,
    inputMessage,
    isLoading,
    error,
    sessionId,
    showSessionExpiredModal,
    handleSendMessage,
    handleInputChange,
    handleClearChat,
    handleSuggestionClick,
    handleDismissSessionExpiredModal,
  } = useChat();

  // Effect to send a message to the parent window for resizing the chatbot
  useEffect(() => {
    window.parent.postMessage(
      { type: "resizeChatbot", expanded: isExpanded },
      "*"
    );
  }, [isExpanded]);

  // Effect to add and remove wheel event listener to prevent scroll propagation
  useEffect(() => {
    const container = appContainerRef.current;

    const preventScrollPropagation = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // If we're at the top and trying to scroll up, or at the bottom and trying to scroll down
      if (
        (scrollTop === 0 && e.deltaY < 0) ||
        (Math.abs(scrollHeight - clientHeight - scrollTop) < 1 && e.deltaY > 0)
      ) {
        // Let the parent scroll
        return;
      }

      // Otherwise prevent the event from bubbling up
      e.stopPropagation();
    };

    if (container) {
      container.addEventListener('wheel', preventScrollPropagation, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', preventScrollPropagation);
      }
    };
  }, []);

  return (
    <div
      ref={appContainerRef}
      className={`z-50
          h-screen w-screen
           shadow-lg flex flex-col transition-all duration-300 bg-black overflow-hidden`}
      onWheel={(e) => e.stopPropagation()}
    >
      <Header
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        hasMessages={messages.length > 0}
        onClearChat={handleClearChat}
      />

      {error && <ErrorBanner message={error} />}

      <ChatContainer
        messages={messages}
        suggestions={suggestions}
        isLoading={isLoading}
        inputMessage={inputMessage}
        onInputChange={handleInputChange}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
      />

      {showSessionExpiredModal && (
        <SessionExpiredModal onDismiss={handleDismissSessionExpiredModal} />
      )}
    </div>
  );
}

export default App;