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
          className="text-left text-zinc-300 hover:bg-zinc-800 text-sm px-3 py-1 whitespace-normal break-words w-fit"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionList;