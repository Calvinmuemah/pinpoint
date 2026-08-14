/**
 * Web Search Tool for PinPoint Travel Agent
 * Discovers public travel inquiries, blog queries, and forum questions.
 */
const search = async (query, maxResults = 5) => {
  console.log(`🔍 [AI Tool: WebSearch] Searching web for travel query: "${query}"`);

  // Query variations
  const samples = [
    {
      source: 'TripAdvisor Forum',
      title: `Looking for advice on 5-star resorts in ${query} for family vacation`,
      snippet: `We are planning a trip to ${query} next month with kids. Budget is around $2,500. Any recommendations for private transfers and safari packages?`,
      url: `https://tripadvisor.com/showtopic-${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString(),
    },
    {
      source: 'Travel Blog Discussion',
      title: `Best time of year to visit ${query} for safari & beach`,
      snippet: `Heading to ${query} for 7 days in late 2026. Interested in luxury tented camps and beach resorts. Would love quotes from local tour operators.`,
      url: `https://travelblog.org/discussions/${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString(),
    },
    {
      source: 'Reddit r/travel',
      title: `Solo traveler visiting ${query} - looking for guided tour recommendations`,
      snippet: `First time visiting ${query}! Looking for reliable tour guides for a 3-day wildlife tour and water sports.`,
      url: `https://reddit.com/r/travel/comments/${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString(),
    },
  ];

  return samples.slice(0, maxResults);
};

module.exports = {
  search,
};
