'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface ListingLocationMapProps {
  latitude: number
  longitude: number
  title: string
  address: string
  className?: string
  height?: string
}

export function ListingLocationMap({ 
  latitude, 
  longitude, 
  title, 
  address, 
  className = '',
  height = 'h-48'
}: ListingLocationMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={`${height} ${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  // If no coordinates provided, show placeholder
  if (!latitude || !longitude) {
    return (
      <div className={`${height} ${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Location map not available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${height} ${className} relative rounded-lg overflow-hidden`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <Marker position={[latitude, longitude]}>
          <Popup closeButton={false} className="listing-location-popup">
            <div className="p-2 min-w-48">
              <h3 className="font-semibold text-sm mb-1">
                {title}
              </h3>
              <p className="text-xs text-gray-600">
                {address}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
} 