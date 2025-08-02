'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import L from 'leaflet'

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface Venue {
  id: string
  title: string
  latitude: number
  longitude: number
  daily_rate: number
  hourly_rate: number
  images?: string[]
}

interface VenueMapProps {
  venues: Venue[]
  selectedVenue?: string | null
  onVenueSelect?: (venueId: string | null) => void
  className?: string
  height?: string
}

export function VenueMap({ 
  venues, 
  selectedVenue, 
  onVenueSelect, 
  className = '',
  height = 'h-96'
}: VenueMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate map center and zoom based on venues
  const mapConfig = useMemo(() => {
    if (venues.length === 0) {
      // Default to London if no venues
      return {
        center: [51.5074, -0.1278] as [number, number],
        zoom: 10
      }
    }

    // Calculate bounds from venues
    const lats = venues.map(v => v.latitude)
    const lngs = venues.map(v => v.longitude)
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
    
    // Calculate zoom based on the spread of coordinates
    const latSpread = Math.max(...lats) - Math.min(...lats)
    const lngSpread = Math.max(...lngs) - Math.min(...lngs)
    const maxSpread = Math.max(latSpread, lngSpread)
    
    let zoom = 10
    if (maxSpread < 0.01) zoom = 15
    else if (maxSpread < 0.05) zoom = 13
    else if (maxSpread < 0.1) zoom = 12
    else if (maxSpread < 0.5) zoom = 10
    else zoom = 8
    
    return {
      center: [centerLat, centerLng] as [number, number],
      zoom
    }
  }, [venues])

  // Airbnb-style price marker icon
  const createPriceIcon = (price: number, isSelected: boolean = false) => {
    return L.divIcon({
      html: `
        <div class="venue-price-marker ${isSelected ? 'selected' : ''}" style="
          background: ${isSelected ? '#222222' : '#FFFFFF'};
          color: ${isSelected ? '#FFFFFF' : '#222222'};
          padding: 6px 12px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 16px rgba(0,0,0,0.12);
          border: 1px solid ${isSelected ? '#222222' : 'rgba(0,0,0,0.08)'};
          transform: translate(-50%, -50%);
          position: relative;
          white-space: nowrap;
          display: inline-block;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.transform='translate(-50%, -50%) scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'"
        onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'; this.style.boxShadow='0 2px 16px rgba(0,0,0,0.12)'"
        >
          £${price}
        </div>
      `,
      className: 'airbnb-price-marker',
      iconAnchor: [0, 0]
    })
  }

  if (!isMounted) {
    return (
      <div className={`${height} ${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${height} ${className} relative rounded-lg overflow-hidden`}>
      <MapContainer
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={createPriceIcon(venue.daily_rate, selectedVenue === venue.id)}
            eventHandlers={{
              click: () => {
                if (onVenueSelect) {
                  onVenueSelect(selectedVenue === venue.id ? null : venue.id)
                }
              }
            }}
          >
            <Popup closeButton={false} className="airbnb-popup">
              <div className="p-0 min-w-64">
                <div className="relative">
                  {venue.images && venue.images[0] && (
                    <img 
                      src={venue.images[0]} 
                      alt={venue.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-base mb-1 text-gray-900 line-clamp-2">
                      {venue.title}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-900">
                        £{venue.daily_rate}
                        <span className="text-sm font-normal text-gray-600"> / day</span>
                      </span>
                      {venue.hourly_rate && (
                        <span className="text-sm text-gray-600">
                          £{venue.hourly_rate}/hr
                        </span>
                      )}
                    </div>
                    <Link 
                      href={`/listings/${venue.id}`}
                      className="block w-full bg-gray-900 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map overlay with venue count */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{venues.length} venues</span>
        </div>
      </div>
    </div>
  )
} 