// components/LoadingIndicator.jsx
/**
 * LoadingIndicator component displays a loading animation.
 *
 * @component
 */
const LoadingIndicator = () => {
  return (
    <div className="flex items-center mt-2 text-gray-500">
      <div className="loader"></div>
    </div>
  );
};

export default LoadingIndicator;