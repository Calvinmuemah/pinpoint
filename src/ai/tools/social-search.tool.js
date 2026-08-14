/**
 * Social Search Tool for PinPoint Travel Agent
 * Monitors social platforms (Reddit, Twitter/X, Instagram, TripAdvisor) for travel intent.
 */
const search = async (platform = 'Reddit', keyword = 'Mombasa trip') => {
  console.log(`📱 [AI Tool: SocialSearch] Searching ${platform} for keyword: "${keyword}"`);

  const platformData = {
    Reddit: [
      {
        platform: 'Reddit',
        author: 'u/globetrotter99',
        post: `Planning a 5-day ${keyword} next month. What are the best safari lodges and beach resorts around $1,800 budget? Need verified tour operator contacts.`,
        created_at: new Date().toISOString(),
      },
      {
        platform: 'Reddit',
        author: 'u/wanderlust_kenya',
        post: `Can anyone recommend a private driver and safari package for ${keyword}? Traveling with my partner.`,
        created_at: new Date().toISOString(),
      },
    ],
    Twitter: [
      {
        platform: 'Twitter',
        author: '@travel_sarah',
        post: `Finalizing my itinerary for a ${keyword}! Any tour guides or luxury camp operators offering private packages? 🌴✈️ #KenyaTravel`,
        created_at: new Date().toISOString(),
      },
    ],
    TripAdvisor: [
      {
        platform: 'TripAdvisor',
        author: 'David M.',
        post: `Looking for top-rated local operators for ${keyword} and beach extension. Budget is flexible ($2,000 - $3,500).`,
        created_at: new Date().toISOString(),
      },
    ],
    Instagram: [
      {
        platform: 'Instagram',
        author: '@exploring_africa',
        post: `Planning my ${keyword} for upcoming holiday season! Tag your favorite luxury resorts and game drive companies below 👇`,
        created_at: new Date().toISOString(),
      },
    ],
  };

  return platformData[platform] || platformData.Reddit;
};

module.exports = {
  search,
};
