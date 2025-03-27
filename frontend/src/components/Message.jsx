import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RealEsateLoadingIndicator from "./RealEsateLoadingIndicator";

/**
 * Parse and render property listings from JSON to HTML
 * @param {string} message - The message content that may contain JSON property listings
 * @returns {string} The message with JSON property listings converted to HTML cards
 */
function parsePropertyListings(message) {
  // Regular expression to find JSON blocks inside triple backticks
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;

  return message.replace(jsonRegex, (match, jsonString) => {
    try {
      // Parse the JSON data
      const data = JSON.parse(jsonString);

      // If no listings or empty array, return original JSON
      if (!data.listings || data.listings.length === 0) {
        return match;
      }

      // Generate HTML for the property listings
      let listingsHTML = `
        <div class="property-listings-container my-4">
          <div class="text-sm text-gray-400 mb-2">Found ${data.totalResults} properties</div>
          <div class="listings-grid grid gap-4">
      `;

      // Generate a card for each property listing
      data.listings.forEach(listing => {
        // Format the price with commas and dollar sign
        const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'CAD',
          maximumFractionDigits: 0
        }).format(listing.price);

        // Format square footage with commas
        const formattedSqFt = new Intl.NumberFormat('en-US').format(listing.squareFeet);

        listingsHTML += `
          <div class="property-card bg-zinc-900 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div class="property-image h-48 w-full bg-zinc-800 overflow-hidden">
              <img 
                src="${listing.imageUrl || '/house-placeholder.png'}" 
                alt="${listing.address}" 
                class="w-full h-full object-cover"
                onerror="this.onerror=null; this.src='/house-placeholder.png';"
              />
            </div>
            <div class="property-details p-4">
              <div class="property-price text-xl font-bold text-white mb-2">${formattedPrice}</div>
              <div class="property-address text-gray-300 mb-3">${listing.address}, ${listing.city}</div>
              <div class="property-specs flex text-sm text-gray-400 mb-3">
                <div class="beds mr-3">
                  <span class="font-bold">${listing.bedrooms}</span> bed${listing.bedrooms !== 1 ? 's' : ''}
                </div>
                <div class="baths mr-3">
                  <span class="font-bold">${listing.bathrooms}</span> bath${listing.bathrooms !== 1 ? 's' : ''}
                </div>
                <div class="sqft">
                  <span class="font-bold">${formattedSqFt}</span> sq ft
                </div>
              </div>
              <a 
                href="${listing.listingUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="view-listing-btn block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
              >
                View Listing
              </a>
            </div>
          </div>
        `;
      });

      listingsHTML += `
          </div>
        </div>
      `;

      return listingsHTML;
    } catch (error) {
      // If JSON parsing fails, return the original string
      console.error("Failed to parse property listings JSON:", error);
      return match;
    }
  });
}

const Message = ({ messageType, message }) => {
  // Remove bracketed annotations like 【some text】 from the message
  const cleanedMessage = message.replace(/【[^】]+】/g, "");

  // Check if this AI message contains a JSON code block
  if (messageType === "ai" && cleanedMessage.includes("```json")) {
    // Try to match a complete JSON block (with closing backticks)
    const completeJsonBlock = cleanedMessage.match(/```json\s*([\s\S]*?)\s*```/);
    if (!completeJsonBlock) {
      // Incomplete JSON detected.
      // Extract the text before the JSON block starts.
      const jsonStartIndex = cleanedMessage.indexOf("```json");
      const textBefore = cleanedMessage.substring(0, jsonStartIndex);

      return (
        <div
          className={`p-4 text-[14px] flex flex-col gap-3 rounded-xl ${
            messageType === "ai"
              ? "bg-gradient-to-b from-black to-black w-11/12 animate-slide-in-left shadow-lg text-gray-300 border border-zinc-800 ai-message"
              : "bg-gradient-to-b from-red-600 to-red-700 text-gray-200 w-fit max-w-9/10 ml-auto break-words animate-slide-in-right shadow-md"
          }`}
        >
          {messageType === "ai" && <div className="text-sm text-gray-400">AI</div>}
          <div className="react-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {textBefore}
            </ReactMarkdown>
            <RealEsateLoadingIndicator />
          </div>
        </div>
      );
    }
  }

  // Process the message normally if there's no incomplete JSON block
  const processedMessage =
    messageType === "ai" ? parsePropertyListings(cleanedMessage) : cleanedMessage;
  const containsPropertyListings =
    messageType === "ai" && processedMessage !== cleanedMessage;

  return (
    <div
      className={`p-4 text-[14px] flex flex-col gap-3 rounded-xl ${
        messageType === "ai"
          ? "bg-gradient-to-b from-black to-black w-11/12 animate-slide-in-left shadow-lg text-gray-300 border border-zinc-800 ai-message"
          : "bg-gradient-to-b from-red-600 to-red-700  text-gray-200 w-fit max-w-9/10 ml-auto break-words animate-slide-in-right shadow-md"
      }`}
    >
      {messageType === "ai" && <div className="text-sm text-gray-400">AI</div>}
      <div className="react-markdown ">
        {containsPropertyListings ? (
          <div dangerouslySetInnerHTML={{ __html: processedMessage }} />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {processedMessage}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default memo(Message);