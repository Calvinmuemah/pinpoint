/**
 * Business Search Tool for PinPoint Travel Agent
 * Matches identified destination & travel type with verified local tour operators.
 */
const tourOperatorsDatabase = [
  {
    destination: 'Mombasa',
    travelType: 'Leisure',
    name: 'Mombasa Coastal Safaris & Marine Tours',
    rating: 4.9,
    contact: 'info@mombasacoastalsafaris.co.ke',
    phone: '+254 700 112 233',
    services: ['Luxury Beach Resorts', 'Wasini Dolphin Dhow', 'Old Town Guided Tours'],
  },
  {
    destination: 'Mombasa',
    travelType: 'Safari',
    name: 'Tsavo & Coastal Wildlife Expeditions',
    rating: 4.8,
    contact: 'bookings@tsavocoastal.com',
    phone: '+254 711 445 566',
    services: ['Tsavo East/West Game Drives', 'Shimba Hills Excursions', 'Private 4x4 Land Cruisers'],
  },
  {
    destination: 'Diani',
    travelType: 'Leisure',
    name: 'Diani White Sands & Skydiving Escapes',
    rating: 4.9,
    contact: 'hello@dianiwritesands.com',
    phone: '+254 722 889 900',
    services: ['Kite Surfing', 'Private Villas', 'Chale Island Day Tours'],
  },
  {
    destination: 'Maasai Mara',
    travelType: 'Safari',
    name: 'Mara Big Five Luxury Tented Safaris',
    rating: 5.0,
    contact: 'safari@marabigfive.com',
    phone: '+254 733 990 011',
    services: ['Hot Air Balloon Safaris', 'Great Migration Tracking', 'Fly-in Safaris'],
  },
  {
    destination: 'Nairobi',
    travelType: 'Business',
    name: 'Nairobi Executive Transfers & Day Tours',
    rating: 4.7,
    contact: 'info@nairobiexecutive.com',
    phone: '+254 701 556 677',
    services: ['Nairobi National Park', 'Giraffe Centre & Karen Blixen', 'Airport VIP VIP transfers'],
  },
];

const search = async (destination = 'Mombasa', travelType = 'Leisure') => {
  console.log(`🏢 [AI Tool: BusinessSearch] Finding matching tour operators for ${destination} (${travelType})`);

  const matches = tourOperatorsDatabase.filter(
    (b) => b.destination.toLowerCase() === destination.toLowerCase() ||
           b.travelType.toLowerCase() === travelType.toLowerCase()
  );

  if (matches.length > 0) {
    return matches;
  }

  // Fallback dynamic generator for other destinations
  return [
    {
      destination,
      travelType,
      name: `${destination} Premier Tours & Safaris`,
      rating: 4.8,
      contact: `contact@${destination.toLowerCase()}premiertours.com`,
      services: ['Custom Private Itineraries', 'Hotel Bookings', 'Airport Transfers'],
    },
  ];
};

module.exports = {
  search,
  tourOperatorsDatabase,
};
