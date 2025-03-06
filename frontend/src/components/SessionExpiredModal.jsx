/**
 * SessionExpiredModal component displays a modal indicating that the chat session has expired.
 *
 * @component
 * @param {function} onDismiss - Callback function to close the modal.
 */
const SessionExpiredModal = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-2">Session Expired</h3>
        <p className="mb-4">
          Your chat session has expired due to inactivity. A new session has
          been created for you.
        </p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onDismiss}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;