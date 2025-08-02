# FoodTruck Hub – Design System Overview

## 🎯 Purpose

This document outlines the design direction and component standards for FoodTruck Hub, a platform connecting venue owners with available outdoor spaces and food truck vendors looking to trade.

The goal is to create a design system that blends trustworthy UX with the energy and culture of local street food scenes.

---

## 🌈 Brand Personality

**Keywords:** Independent, energetic, local, practical, warm, vibrant, human.

**Tone:** Friendly, authentic, and community-driven. Avoid corporate. Celebrate personality and story.

**Values:**
- Community-first approach
- Authentic local experiences
- Practical solutions for real people
- Celebrating food culture and entrepreneurship

---

## 🎨 Visual Identity

### Color Palette

```css
/* Primary Colors */
--charcoal-black: #1A1A1A;    /* Primary text & base */
--warm-red: #E63946;          /* Accent & CTA */
--mustard-yellow: #FFB703;    /* Highlight */
--off-white: #FAF9F6;         /* Background */
--cool-grey: #D9D9D9;         /* Borders & muted elements */
--electric-blue: #3A86FF;     /* Reserved for Stripe/links only */

/* Supporting Colors */
--success-green: #2D6A4F;     /* Success states */
--warning-orange: #F77F00;    /* Warning states */
--error-red: #D00000;         /* Error states */
--muted-text: #6C757D;        /* Secondary text */
```

### Typography

**Headings:** Bebas Neue – bold, condensed, high impact
- Use for hero titles, section headers, and major CTAs
- Provides strong visual hierarchy
- Evokes street food poster aesthetic

**Body Text:** Satoshi or Inter – clean sans-serif, readable
- Primary choice: Satoshi (if available)
- Fallback: Inter
- Excellent readability across all devices
- Professional yet approachable

**Font Scales:**
- Display: 3.5rem (56px) - Hero headlines
- H1: 2.5rem (40px) - Page titles
- H2: 2rem (32px) - Section headers
- H3: 1.5rem (24px) - Card titles
- H4: 1.25rem (20px) - Sub-headers
- Body: 1rem (16px) - Standard text
- Small: 0.875rem (14px) - Meta text

### Icons

**Icon Library:** Lucide or Heroicons
- Prefer outlined or slightly filled for contrast
- Consistent line weight across all icons
- Inject personality: not too sterile
- Custom food/truck themed icons where needed

**Icon Usage Guidelines:**
- 16px: Small inline icons
- 20px: Standard UI icons
- 24px: Feature icons
- 32px+: Hero/decorative icons

---

## 🧱 Component System

### Buttons

```typescript
// Button Variants
Primary: {
  background: "var(--warm-red)",
  color: "white",
  hover: "darken(--warm-red, 10%)"
}

Secondary: {
  background: "transparent",
  border: "1px solid var(--charcoal-black)",
  color: "var(--charcoal-black)",
  hover: "var(--charcoal-black) background"
}

CTA: {
  background: "var(--mustard-yellow)",
  color: "var(--charcoal-black)",
  borderRadius: "rounded-full",
  fontWeight: "bold",
  hover: "darken(--mustard-yellow, 10%)"
}
```

### Cards

**Listing Cards:**
- Hero image with overlay badges
- Title, location, pricing hierarchy
- Amenity badge grid
- Clear "Book Now" CTA
- Hover states for interactivity

**Vendor Profile Cards:**
- Truck name and cuisine type
- Avatar/hero photo
- Social links integration
- Rating system (future)
- Contact/book actions

**Feature Cards:**
- Icon + title + description
- Consistent padding and spacing
- Subtle shadows for depth

### Forms

**Guidelines:**
- Use `@tailwindcss/forms` base
- Consistent padding: `px-4 py-3`
- Rounded corners: `rounded-lg`
- Clear label hierarchy
- Error states with `--error-red`
- Focus states with `--electric-blue`

**Form Elements:**
- Input fields with subtle borders
- Select dropdowns with custom styling
- Checkbox/radio with brand colors
- Date pickers with calendar integration

### Badges (for amenities)

**Design:**
- Pill shape with rounded corners
- Grey background with icon + text
- Icon left-aligned
- Consistent sizing and spacing

```css
.amenity-badge {
  background: var(--cool-grey);
  color: var(--charcoal-black);
  border-radius: 1rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
```

---

## 🧭 Page Layout Guidelines

### Homepage

**Hero Section:**
- Split-screen design or centered with dual CTAs
- Primary: "List Your Space" (venue owners)
- Secondary: "Find a Space" (food truck vendors)
- Background: High-quality food truck/venue imagery

**Features Section:**
- "How it works" with numbered steps
- Split between venue owners and vendors
- Use feature cards with icons

**Social Proof:**
- Vendor spotlight carousel
- Testimonials from both sides of marketplace
- Success stories and community highlights

### Browse/Search Page

**Filter Sidebar:**
- Collapsible on mobile
- Clear filter categories
- Active filter indicators
- Quick reset option

**Results Grid:**
- Responsive card layout
- Image-first design
- Quick booking actions
- Sort and filter controls

### Listing Detail Page

**Image Gallery:**
- Hero image with lightbox
- Thumbnail navigation
- Mobile-optimized swipe

**Information Hierarchy:**
1. Title, location, pricing
2. Amenity badges grid
3. Description and details
4. Embedded map
5. Booking sidebar/bottom

**Booking Component:**
- Calendar integration
- Pricing calculator
- Clear booking CTA
- Security/payment badges

### Vendor Profiles

**Profile Header:**
- Hero banner (optional truck image)
- Profile photo and truck name
- Cuisine tags and description
- Social media links

**Content Sections:**
- About/bio section
- Menu highlights or photos
- Past venues (if available)
- Contact and booking info

### Dashboard Pages

**Venue Owner Dashboard:**
- Earnings overview
- Booking calendar
- Listing management
- Performance metrics

**Vendor Dashboard:**
- Upcoming bookings
- Payment history
- Profile management
- Favorite venues

---

## 📦 Assets & Deliverables

### Logo Design
- **Primary:** Horizontal lockup for headers
- **Secondary:** Square/circular for avatars
- **Variations:** Light and dark versions
- **File formats:** SVG, PNG (multiple sizes)

### Icon System
- **Base:** Customized Lucide icon set
- **Custom:** Food truck, venue, amenity-specific icons
- **Formats:** SVG with consistent stroke width
- **Sizes:** 16px, 20px, 24px, 32px variants

### Brand Assets
- **Textures:** Optional chalkboard, wood grain, brick
- **Patterns:** Subtle background patterns
- **Photography:** Hero images, lifestyle shots
- **Illustrations:** Custom food truck illustrations

### Design Tokens

```css
/* Spacing Scale */
--space-xs: 0.25rem;    /* 4px */
--space-sm: 0.5rem;     /* 8px */
--space-md: 1rem;       /* 16px */
--space-lg: 1.5rem;     /* 24px */
--space-xl: 2rem;       /* 32px */
--space-2xl: 3rem;      /* 48px */

/* Border Radius */
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;  /* Full rounded */

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

---

## 🚧 Implementation Guidelines

### Development Standards

**CSS Framework:** Tailwind CSS with custom design tokens
**Component Library:** Shadcn/ui as base with custom styling
**Responsive Design:** Mobile-first approach
**Accessibility:** WCAG 2.1 AA compliance

### Component Architecture

```typescript
// Example component structure
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'cta';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}
```

### File Organization

```
/src/components/
  /ui/           # Base components (buttons, inputs, etc.)
  /layout/       # Layout components (header, nav, footer)
  /features/     # Feature-specific components
  /icons/        # Custom icon components
```

---

## 🎯 Next Steps

### Phase 1: Foundation
- [x] Implement base color palette in Tailwind config
- [x] Set up typography system with Bebas Neue + Inter
- [x] Create base component library (buttons, cards, forms)
- [ ] Design and implement logo/branding

### Phase 2: Core Components
- [ ] Build listing card component system
- [ ] Create vendor profile components
- [ ] Implement search/filter interface
- [ ] Design booking flow components

### Phase 3: Polish
- [ ] Add custom illustrations and photography
- [ ] Implement micro-interactions and animations
- [ ] Create comprehensive style guide
- [ ] Conduct usability testing and refinement

### Phase 4: Brand Extension
- [ ] Develop marketing materials
- [ ] Create brand guidelines document
- [ ] Design email templates
- [ ] Social media assets

---

## 📐 Design Principles

1. **Community First:** Every design decision should strengthen the connection between venue owners and food truck vendors

2. **Authentic Expression:** Celebrate the personality and stories of local food culture

3. **Practical Functionality:** Prioritize usability and clear user flows over decorative elements

4. **Inclusive Access:** Ensure the platform is accessible to users of all technical skill levels

5. **Trust & Safety:** Design elements should reinforce security and reliability in transactions

6. **Mobile Excellence:** Mobile experience should be equivalent to (not a subset of) desktop

---

*This design system is a living document that will evolve with the platform and community needs.* 