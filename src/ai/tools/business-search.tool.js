const search = async (destination, travelType = 'Leisure') => {
  // Modular Business Search Tool Interface (Matches travel intent to local tour operators)
  return [
    { name: `${destination} Coastal Safaris & Tours`, category: travelType, rating: 4.9 },
    { name: `Luxury ${destination} Resort & Escapes`, category: travelType, rating: 4.8 },
  ];
};

module.exports = {
  search,
};
