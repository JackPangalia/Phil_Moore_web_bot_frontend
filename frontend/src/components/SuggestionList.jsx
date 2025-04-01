/**
 * SuggestionList component displays a list of clickable suggestions.
 *
 * @component
 * @param {string[]} suggestions - An array of suggestion strings.
 * @param {function} onSuggestionClick - Callback function to handle suggestion clicks.
 */
const SuggestionList = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="mb-20 flex flex-col gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className=" text-left text-gray-300 text-sm py-2 px-2 whitespace-normal break-words w-fit hover:text-white tranition-colors duration-200 hover:cursor-pointer"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionList;