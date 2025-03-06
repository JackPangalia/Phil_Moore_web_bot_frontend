// components/ChatContainer.jsx
import { useRef, useEffect } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";
import SuggestionList from "./SuggestionList";
import LoadingIndicator from "./LoadingIndicator";

/**
 * ChatContainer component renders a chat interface with messages, suggestions,
 * an input field, and a loading indicator.
 *
 * @component
 * @param {object[]} messages - An array of message objects.
 * @param {string[]} suggestions - An array of suggestion strings.
 * @param {boolean} isLoading - Indicates whether the chat is loading.
 * @param {string} inputMessage - The current input message.
 * @param {function} onInputChange - Callback function for input message changes.
 * @param {function} onSendMessage - Callback function for sending a message.
 * @param {function} onSuggestionClick - Callback function for clicking a suggestion.
 *
 */
const ChatContainer = ({
  messages,
  suggestions,
  isLoading,
  inputMessage,
  onInputChange,
  onSendMessage,
  onSuggestionClick,
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages, loading state, or suggestions change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, suggestions]);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-[4.3rem] space-y-4 ">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Start a new conversation</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <Message
            key={index}
            messageType={msg.messageType}
            message={msg.message}
          />
        ))}

        {isLoading && <LoadingIndicator />}

        {suggestions.length > 0 && (
          <SuggestionList
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        inputMessage={inputMessage}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />
    </>
  );
};

export default ChatContainer;