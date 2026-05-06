export const mockConnectors = {
  'mock://health/find-nearest-care': ({ approximate_location, route_preference }) => ({ result: 'nearest_care_location_returned', recommendation: `Use low-crowd route. Location set: ${approximate_location}. ${route_preference}` }),
  'mock://travel/rebook': () => ({ result:'options_only', options:['Flight A safer route','Flight B fewer transfers'], booked:false })
};
