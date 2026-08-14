const search = async (platform, keyword) => {
  // Modular Social Search Tool Interface (Reddit, TripAdvisor, Twitter/X)
  return [
    { platform, post: `Looking for recommendations for ${keyword}` },
  ];
};

module.exports = {
  search,
};
