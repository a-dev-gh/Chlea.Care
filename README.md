# Chlea Care

E-commerce platform and admin dashboard for a beauty and skincare brand. Features a public storefront with product catalog, brand pages, shopping cart, and wish lists, plus a full admin panel for managing products, orders, blog content, and site configuration.

**Live:** [chlea.care](https://chlea.care)

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **State:** Zustand (cart), React Context (auth, settings)
- **Routing:** React Router 6
- **Auth & Database:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Cloudflare Workers

## Features

### Storefront
- **Product Catalog** -- Filterable grid with badges, brand/label/price filtering, active filter tags, and category navigation
- **Men's Catalog** -- Dedicated section with dark theme and separate filters
- **Brand Pages** -- Individual brand profiles with filtered product listings
- **Shopping Cart** -- Slide-out drawer with full checkout page and WhatsApp order integration
- **User Accounts** -- Profile management, saved addresses, order history, password reset
- **Checkout** -- Auto-fill from profile, bank transfer or COD payment, Santo Domingo / Interior delivery
- **Wish Lists** -- User-created lists for saving products
- **Blog** -- Articles and posts with rich text content
- **Testimonials** -- Customer review carousel
- **Instagram Integration** -- Embedded posts and reels

### Admin Panel
- **Dashboard** -- Overview analytics
- **Product Management** -- Full CRUD with image upload, pricing, badges, and labels
- **Brand Management** -- Brand profiles with logos and categories
- **Order Management** -- Track and manage WhatsApp orders
- **Blog Editor** -- Rich text editor for creating and publishing articles
- **Site Settings** -- Hero content, navigation dropdowns, social links, testimonials, badges

### Security
- Row-Level Security (RLS) on all Supabase tables
- Role-based admin access (super_admin, owner, employee)
- Users can only manage their own profiles and lists

## Getting Started

```bash
npm install

# Create .env.local with your Supabase credentials
cp .env.example .env.local

npm run dev
```

### Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WA_NUMBER=your_whatsapp_number
VITE_R2_BUCKET_URL=your_r2_bucket_url
```

### Database Setup

Run migration SQL in the Supabase SQL Editor (Dashboard > SQL Editor):

1. Copy the contents of `supabase/migration.sql`
2. Paste and run in the Supabase SQL Editor
3. The site works without Supabase (falls back to seed data) for local development

## Project Structure

```
src/
  components/    # Shared UI (Button, Modal, Toast, ProductGrid, CartDrawer, etc.)
  pages/         # Public storefront pages
  pages/admin/   # Admin panel pages
  hooks/         # useAuth, useProducts, useCart, useLists, useSiteSettings, useBadges
  contexts/      # AuthContext (Supabase Auth provider)
  utils/         # supabase.ts, db.ts, adminApi.ts, whatsapp.ts, formatPrice.ts
  types/         # TypeScript interfaces for all DB tables
  data/          # Seed/fallback data (used when Supabase is not configured)
  styles/        # CSS tokens, global styles, animations
supabase/
  migration.sql  # Database schema with RLS policies (run in Supabase SQL Editor)
```

## Deployment

```bash
npm run build
npx wrangler deploy
```
