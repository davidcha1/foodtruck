# FoodTruck Marketplace

A modern marketplace web application connecting venue owners with unused outdoor spaces to food truck vendors seeking prime trading locations. Built with Next.js, Tailwind CSS, Shadcn UI, and Supabase.

## 🚀 Features

### For Venue Owners
- **Listing Management**: Create, edit, and manage detailed venue listings
- **Amenity Specification**: Define available utilities (water, electricity, gas, shelter, etc.)
- **Flexible Pricing**: Set hourly, daily, and weekly rates
- **Photo Uploads**: Showcase your space with high-quality images
- **Dashboard**: Track bookings, earnings, and manage availability
- **Location Mapping**: Integrated map functionality for precise location marking

### For Food Truck Vendors
- **Advanced Search**: Filter by location, price, amenities, and availability
- **Secure Booking**: Book and pay for venues with integrated Stripe payments
- **Vendor Dashboard**: Manage bookings, view payment history, and download invoices
- **Amenity Filtering**: Find venues with specific requirements (power, water, etc.)

### Platform Features
- **Secure Authentication**: Role-based access control (venue owners vs vendors)
- **Payment Processing**: Stripe Connect for secure transactions and automated payouts
- **Real-time Updates**: Live booking status and availability updates
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **File Storage**: Secure image upload and management via Supabase Storage

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Payments**: Stripe Connect
- **Maps**: Google Maps API / Mapbox
- **Deployment**: Vercel
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Notifications**: Sonner

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Stripe account with Connect enabled
- Google Maps API key (or Mapbox token)
- Git installed

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/foodtruck-marketplace.git
cd foodtruck-marketplace
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Copy the example environment file and configure your variables:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Add your environment variables to \`.env.local\`:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# OR
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL schema from \`supabase/schema.sql\`

This will create all necessary tables, indexes, triggers, and Row Level Security (RLS) policies.

### 5. Storage Setup

In your Supabase dashboard:

1. Go to Storage
2. The \`listing-images\` bucket should be created automatically by the schema
3. Ensure the bucket is set to public for image access

### 6. Stripe Setup

1. Enable Stripe Connect in your Stripe dashboard
2. Configure webhooks for payment events
3. Set up your platform fee structure

### 7. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📊 Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users**: Extended user profiles with role-based access
- **listings**: Venue listings with location and pricing data
- **amenities**: Detailed amenity information for each listing
- **bookings**: Reservation and booking management
- **payments**: Payment processing and payout tracking

All tables include Row Level Security (RLS) policies for secure data access.

## 🔐 Authentication & Authorization

The application implements role-based authentication:

- **Venue Owners**: Can create/manage listings and view booking requests
- **Vendors**: Can search/book venues and manage their reservations
- **Public Users**: Can browse venues but must sign up to book

## 💳 Payment Integration

Stripe Connect is integrated for:

- Secure payment processing
- Automated vendor payouts
- Platform fee collection
- Invoice generation
- Refund handling

## 🗺 Maps Integration

Location services include:

- Address geocoding
- Interactive map display
- Radius-based search
- Pin-point location marking

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: System-based theme switching
- **Accessibility**: WCAG compliant components
- **Loading States**: Smooth user experience with loading indicators
- **Error Handling**: Comprehensive error messaging and recovery

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   \`\`\`bash
   npx vercel
   \`\`\`

2. **Environment Variables**:
   Add all environment variables in your Vercel dashboard

3. **Domain Configuration**:
   Update \`NEXT_PUBLIC_APP_URL\` to your production domain

4. **Database Migration**:
   Ensure your Supabase database is properly configured for production

### Manual Deployment

1. **Build the Application**:
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start Production Server**:
   \`\`\`bash
   npm start
   \`\`\`

## 🔧 Development

### Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── listings/       # Listing-related components
│   └── ui/             # Shadcn UI components
├── contexts/           # React Context providers
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles
\`\`\`

### Key Commands

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
\`\`\`

### Adding New Components

Use Shadcn UI CLI to add new components:

\`\`\`bash
npx shadcn@latest add [component-name]
\`\`\`

## 🧪 Testing

The application includes testing setup for:

- Unit tests with Jest
- Integration tests with React Testing Library
- End-to-end tests with Playwright

\`\`\`bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
\`\`\`

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**:
   - Verify your environment variables
   - Check your Supabase project URL and keys
   - Ensure RLS policies are correctly configured

2. **Stripe Integration Problems**:
   - Confirm webhook endpoints are configured
   - Verify API keys are for the correct environment (test/live)
   - Check webhook secret matches your environment

3. **Image Upload Failures**:
   - Ensure Supabase storage bucket is public
   - Check file size limits
   - Verify storage policies allow uploads

4. **Build Errors**:
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript errors
   - Verify all environment variables are set

## 📈 Performance Optimization

The application includes several performance optimizations:

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting with dynamic imports
- **Caching**: Appropriate caching strategies for static and dynamic content
- **Database Optimization**: Proper indexing and query optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for backend-as-a-service
- [Stripe](https://stripe.com/) for payment processing
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the troubleshooting section above

---

Built with ❤️ for the food truck community
