import { EnhancedListingForm } from '@/components/listings/EnhancedListingForm'

export default function CreateListingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="container mx-auto px-4 py-8">
        <EnhancedListingForm />
      </div>
    </div>
  )
} 