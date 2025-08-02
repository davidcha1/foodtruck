'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Layers } from 'lucide-react'
import type { VenueWithAmenities } from './VenueSearchResults'

interface VenueMapViewProps {
  venues: VenueWithAmenities[]
  isLoading: boolean
}

export function VenueMapView({ venues, isLoading }: VenueMapViewProps) {
  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-96 relative overflow-hidden">
      {/* Map placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="bg-white rounded-full p-4 shadow-lg mb-4 mx-auto w-fit">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Interactive Map View</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Map integration with Google Maps or Mapbox coming soon. 
            You'll be able to see venues plotted on an interactive map with clustering and distance calculations.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Navigation className="h-4 w-4" />
            <span>GPS Location</span>
            <span>•</span>
            <Layers className="h-4 w-4" />
            <span>Satellite View</span>
          </div>
        </div>
      </div>

      {/* Venue markers overlay (simulated) */}
      <div className="absolute inset-0 pointer-events-none">
        {venues.slice(0, 5).map((venue, index) => (
          <div
            key={venue.id}
            className="absolute bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg pointer-events-auto cursor-pointer"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`,
            }}
            title={venue.title}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="secondary" className="shadow-lg">
          <Navigation className="h-4 w-4 mr-2" />
          Center Map
        </Button>
        <Button size="sm" variant="secondary" className="shadow-lg">
          <Layers className="h-4 w-4 mr-2" />
          Map Type
        </Button>
      </div>

      {/* Results summary */}
      <div className="absolute bottom-4 left-4">
        <Badge variant="secondary" className="shadow-lg">
          {venues.length} venues found
        </Badge>
      </div>
    </Card>
  )
} 