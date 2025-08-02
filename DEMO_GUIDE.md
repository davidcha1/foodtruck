# 🚀 FoodTruck Hub Demo Guide

## 🎯 Demo Overview
This is a fully functional food truck marketplace connecting venue owners with food truck vendors. The demo showcases the complete booking flow, payment processing, and user management.

## 📊 Demo Data Available
- **5 Venues** across the UK (London, Manchester, Birmingham, Liverpool, Edinburgh)
- **3 Food Truck Vendors** (Mexican, American, Italian cuisine)
- **6 Sample Bookings** (mix of completed and upcoming)
- **Real-time availability** and booking system

## 🎭 Demo Scenarios

### 1. **Venue Owner Experience** (5 minutes)
**Login as:** `sarah.market@example.com` (password: any password works in dev)

**Demo Flow:**
1. **Dashboard** - Show venue management, booking calendar
2. **Listings** - Display venue details, amenities, pricing
3. **Bookings** - Show incoming booking requests and management
4. **Revenue** - Demonstrate earnings tracking

**Key Features to Highlight:**
- Real-time booking notifications
- Calendar integration
- Revenue tracking
- Venue optimization tools

### 2. **Food Truck Vendor Experience** (5 minutes)
**Login as:** `vendor.taco@example.com` (password: any password works in dev)

**Demo Flow:**
1. **Browse Venues** - Show venue search and filtering
2. **Venue Details** - Display amenities, pricing, location
3. **Booking Process** - Walk through booking flow
4. **Payment** - Demonstrate secure payment processing
5. **Booking Management** - Show upcoming and past bookings

**Key Features to Highlight:**
- Advanced venue search with filters
- Real-time availability checking
- Secure payment processing
- Booking management dashboard

### 3. **Platform Features** (3 minutes)
**Demo Flow:**
1. **Homepage** - Show marketplace overview
2. **Venue Map** - Interactive map with venue locations
3. **Search & Filters** - Demonstrate advanced search
4. **Mobile Responsive** - Show mobile experience

## 🔧 Technical Setup

### Current Status ✅
- ✅ Local Supabase database running
- ✅ Sample data loaded (5 venues, 3 vendors, 6 bookings)
- ✅ CSS styling working
- ✅ Authentication system functional
- ✅ Booking system operational
- ✅ Payment processing (mock)
- ✅ Real-time updates

### Environment Variables Set
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[working]
SUPABASE_SERVICE_ROLE_KEY=[working]
```

### Missing for Production (Optional for Demo)
- Stripe payment processing (currently mocked)
- Google Maps API (currently using placeholder)
- Email notifications (can be added later)

## 🎪 Demo Script

### Opening (1 minute)
"Welcome to FoodTruck Hub - the marketplace connecting venue owners with food truck vendors. Today I'll show you how we solve the pain points in the food truck industry."

### Problem Statement (30 seconds)
"Food truck vendors struggle to find reliable venues, while venue owners have empty spaces. Our platform creates a win-win solution."

### Solution Demo (8 minutes)
1. **Venue Owner Journey** (3 minutes)
   - Show dashboard with revenue tracking
   - Demonstrate booking management
   - Highlight automation features

2. **Vendor Journey** (3 minutes)
   - Browse available venues
   - Book with secure payment
   - Manage bookings

3. **Platform Features** (2 minutes)
   - Interactive map
   - Advanced search
   - Mobile experience

### Business Model (1 minute)
- **Commission-based**: 10% platform fee on bookings
- **Subscription tiers**: Premium features for venue owners
- **Payment processing**: Additional revenue stream

### Market Opportunity (30 seconds)
- UK food truck market: £2.3B annually
- 15,000+ food trucks in UK
- Growing demand for street food

## 🚀 Next Steps for Full Launch

### Phase 1 (1-2 months)
- [ ] Integrate real Stripe payments
- [ ] Add Google Maps integration
- [ ] Implement email notifications
- [ ] Add user verification system

### Phase 2 (2-3 months)
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Marketing automation
- [ ] Partnership integrations

### Phase 3 (3-6 months)
- [ ] International expansion
- [ ] Advanced booking features
- [ ] AI-powered matching
- [ ] Enterprise solutions

## 💡 Demo Tips

1. **Keep it conversational** - Ask questions about their experience
2. **Show real value** - Focus on pain points solved
3. **Be prepared for questions** - Know the technical details
4. **Have backup plans** - If something breaks, show screenshots
5. **End with clear next steps** - What do you need to move forward?

## 🔗 Quick Links
- **App URL**: http://localhost:3003
- **Supabase Studio**: http://127.0.0.1:54323
- **Database**: Local PostgreSQL with sample data

## 📞 Support
If anything breaks during the demo:
1. Restart the dev server: `npm run dev`
2. Check Supabase status: `supabase status`
3. Reset database if needed: `supabase db reset`

---

**Good luck with your demo! 🚀** 