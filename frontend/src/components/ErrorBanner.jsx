// components/ErrorBanner.jsx
/**
 * ErrorBanner component displays an error message in a banner.
 *
 * @component
 * @param {string} message - The error message to display.
 */
const ErrorBanner = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-sm">
      <p className="font-bold">Error</p>
      <p>{message} Refresh the page or try to send a message</p>
    </div>
  );
};

export default ErrorBanner;