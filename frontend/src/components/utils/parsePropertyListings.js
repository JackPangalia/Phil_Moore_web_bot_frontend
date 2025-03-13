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
                src="${listing.imageUrl || '/placeholder-home.jpg'}" 
                alt="${listing.address}" 
                class="w-full h-full object-cover"
                onerror="this.onerror=null; this.src='/placeholder-home.jpg';"
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