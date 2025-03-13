// components/ChatInput.jsx
import Send from "../Icons/Send";

/**
 * ChatInput component renders an input field and send button for chat messages.
 *
 * @component
 * @param {string} inputMessage - The current input message.
 * @param {function} onInputChange - Callback function for input message changes.
 * @param {function} onSendMessage - Callback function for sending a message.
 * @param {boolean} isLoading - Indicates whether the chat is currently loading.
 * 
 */
const ChatInput = ({ inputMessage, onInputChange, onSendMessage, isLoading }) => {
  return (
    <div className="absolute bottom-0 left-4 right-4 z-10 bg-black h-[4rem] text-white">
      <form
        onSubmit={onSendMessage}
        className=" border-zinc-700 flex items-center rounded bg-zinc-950"
      >
        <input
          className="flex-1 outline-none px-5 py-2"
          placeholder="Ask a question..."
          value={inputMessage}
          onChange={onInputChange}
        />
        <button
          type="submit"
          className="py-1 px-2 hover:cursor-pointer"
          disabled={!inputMessage.trim() || isLoading}
        >
          <Send />
        </button>
      </form>
    </div>
  );
};
export default ChatInput;