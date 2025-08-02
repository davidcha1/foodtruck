// Geocoding utilities for location search

export interface Coordinates {
  lat: number
  lng: number
}

export interface GeocodingResult {
  coordinates: Coordinates
  formatted_address: string
  place_name: string
  country: string
}

/**
 * Geocode a location string to coordinates using a free geocoding service
 * Using Nominatim (OpenStreetMap) API which is free and doesn't require API keys
 */
export async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  if (!location.trim()) return null

  try {
    const encodedLocation = encodeURIComponent(location.trim())
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1&countrycodes=gb&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FoodTruck-Hub-App/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        formatted_address: result.display_name,
        place_name: result.name || location,
        country: result.address?.country || 'UK'
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLng = toRad(coord2.lng - coord1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Filter venues by distance from a location
 */
export function filterVenuesByDistance(
  venues: any[], 
  searchCoordinates: Coordinates, 
  radiusKm: number
): any[] {
  return venues.filter(venue => {
    if (!venue.latitude || !venue.longitude) {
      return false // Skip venues without coordinates
    }

    const venueCoords: Coordinates = {
      lat: venue.latitude,
      lng: venue.longitude
    }

    const distance = calculateDistance(searchCoordinates, venueCoords)
    return distance <= radiusKm
  }).map(venue => ({
    ...venue,
    distance: calculateDistance(searchCoordinates, {
      lat: venue.latitude,
      lng: venue.longitude
    })
  }))
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.warn('Geolocation error:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

/**
 * Popular UK cities with their coordinates for quick location suggestions
 */
export const popularUKCities = [
  { name: 'London', coordinates: { lat: 51.5074, lng: -0.1278 } },
  { name: 'Manchester', coordinates: { lat: 53.4808, lng: -2.2426 } },
  { name: 'Birmingham', coordinates: { lat: 52.4862, lng: -1.8904 } },
  { name: 'Leeds', coordinates: { lat: 53.8008, lng: -1.5491 } },
  { name: 'Glasgow', coordinates: { lat: 55.8642, lng: -4.2518 } },
  { name: 'Sheffield', coordinates: { lat: 53.3811, lng: -1.4701 } },
  { name: 'Bradford', coordinates: { lat: 53.7960, lng: -1.7594 } },
  { name: 'Liverpool', coordinates: { lat: 53.4084, lng: -2.9916 } },
  { name: 'Edinburgh', coordinates: { lat: 55.9533, lng: -3.1883 } },
  { name: 'Bristol', coordinates: { lat: 51.4545, lng: -2.5879 } },
  { name: 'Cardiff', coordinates: { lat: 51.4816, lng: -3.1791 } },
  { name: 'Leicester', coordinates: { lat: 52.6369, lng: -1.1398 } },
  { name: 'Wakefield', coordinates: { lat: 53.6833, lng: -1.5000 } },
  { name: 'Coventry', coordinates: { lat: 52.4068, lng: -1.5197 } },
  { name: 'Nottingham', coordinates: { lat: 52.9548, lng: -1.1581 } },
  { name: 'Preston', coordinates: { lat: 53.7632, lng: -2.7031 } },
  { name: 'Newcastle', coordinates: { lat: 54.9783, lng: -1.6178 } },
  { name: 'Brighton', coordinates: { lat: 50.8225, lng: -0.1372 } },
  { name: 'Aberdeen', coordinates: { lat: 57.1497, lng: -2.0943 } },
  { name: 'Plymouth', coordinates: { lat: 50.3755, lng: -4.1427 } }
]

/**
 * Get coordinates for a city name from our popular cities list
 * This provides instant results for common searches without API calls
 */
export function getPopularCityCoordinates(cityName: string): Coordinates | null {
  const city = popularUKCities.find(
    city => city.name.toLowerCase() === cityName.toLowerCase()
  )
  return city ? city.coordinates : null
} 