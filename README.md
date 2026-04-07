# Chlea Care

E-commerce platform and admin dashboard for a beauty and skincare brand. Features a public storefront with product catalog, brand pages, shopping cart, and wish lists, plus a full admin panel for managing products, orders, blog content, and site configuration.

**Live:** [chlea.care](https://chlea.care)

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **State:** Zustand (cart, auth, site settings)
- **Routing:** React Router 6
- **Auth & Database:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Cloudflare Workers

## Features

### Storefront
- **Product Catalog** -- Filterable grid with badges (hot, sale), brand filtering, and category navigation
- **Brand Pages** -- Individual brand profiles with filtered product listings
- **Shopping Cart** -- Slide-out drawer with WhatsApp order integration
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

SQL migration and seed files are in `supabase/`:

```bash
# Apply schema
psql -f supabase/migration.sql

# Load seed data
psql -f supabase/seed.sql
```

## Project Structure

```
src/
  components/    # Shared UI (Button, Modal, Toast, Skeleton, Badge, etc.)
  pages/         # Public storefront pages
  admin/         # Admin panel pages and components
  hooks/         # useAuth, useProducts, useCart, useLists, useSiteSettings
  lib/           # Supabase client
  store/         # Zustand stores
supabase/
  migration.sql  # Database schema with RLS policies
  seed.sql       # Initial data
```

## Deployment

```bash
npm run build
npx wrangler deploy
```
