<div align="center">
  <img src="public/chlea-care-logo.svg" alt="Chlea Care" height="64" />
  <h1>Chlea Care</h1>
  <p><em>"Tu cuidado y belleza es nuestra prioridad"</em></p>

  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
  ![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)
  ![License](https://img.shields.io/badge/License-Private-red?style=flat-square)

  **Live Storefront:** [chlea.care](https://chlea.care) &nbsp;|&nbsp; **Admin Panel:** [estudio.chlea.care](https://estudio.chlea.care)
</div>

---

Full-stack e-commerce platform for a Dominican beauty and skincare brand. Features a Spanish-language public storefront with a filterable product catalog, brand pages, WhatsApp-based checkout, and user accounts — plus a fully role-gated admin panel hosted on a dedicated subdomain.

---

## Table of Contents

- [Live Links](#live-links)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Changelog](#changelog)
- [Known Issues / Pending Work](#known-issues--pending-work)
- [Credits](#credits)

---

## Live Links

| Environment | URL |
|---|---|
| Public Storefront | https://chlea.care |
| Admin Panel | https://estudio.chlea.care |

The admin panel is served from a **dedicated subdomain** (`estudio.chlea.care`). When `App.tsx` detects this hostname, it renders only admin routes at the root path — no `/admin` prefix needed.

For local development, admin routes are also accessible at `/admin/...` (e.g. `http://localhost:5173/admin/productos`).

---

## Features

### Storefront

- **Catalogo** — Filterable product grid with faceted search: category tabs, brand picker, price slider, label filters (e.g. "Tipo de Cabello", "Preocupaciones"), active filter chips, and free-text search
- **Hombres** — Dedicated men's section with a separate dark-theme catalog
- **Marcas** — Brand listing page plus individual brand profile pages (`/marcas/:slug`) with filtered product grids
- **Carrito** — Slide-out cart drawer + full `/carrito` checkout page with order confirmation
- **Checkout** — Supports bank transfer and cash-on-delivery (Santo Domingo only); interior deliveries via Vimenpaq, Transporte Espinal, Caribe Tours, etc.; form auto-fills from saved profile when logged in
- **Mis Listas** — Client-side wishlist management (localStorage, Zustand + persist); users can create named lists, add/remove products, and toggle items from any product card
- **Cuenta** — User account with tabs for profile editing, saved delivery addresses, password/security, and order history
- **Blog** — Article listing and individual post pages with rich text body
- **Politicas** — Shipping policy (`/politicas-envio`) and refund policy (`/politicas-reembolso`) pages with content editable from the admin panel
- **Homepage** — Rotating hero slider, hot products grid, brands carousel, Instagram feed embed, testimonials carousel, and "How it Works" section

### Admin Panel (`estudio.chlea.care`)

| Route | Section | Access |
|---|---|---|
| `/` / `/dashboard` | Stats overview — products, brands, pending orders, pending testimonials | All roles |
| `/productos` | Full product CRUD — name, price, category, badge, labels, images (multi-upload), stock status, by-request flag | All roles |
| `/marcas` | Brand CRUD — name, slug, tagline, logo, premier flag, categories | All roles |
| `/etiquetas` | Label group management — filter facet names and their sub-values | All roles |
| `/badges` | Admin-managed badge list (e.g. "Bestseller", "Nuevo") with emoji and color | All roles |
| `/ordenes` | WhatsApp order tracking — view, update status, filter by status | All roles |
| `/social` | Instagram post/reel embed management | All roles |
| `/blog` | Blog post CRUD with rich text editor | All roles |
| `/testimonios` | Approve / reject submitted testimonials | All roles |
| `/navegacion` | Category nav dropdown link management | super_admin, owner |
| `/configuracion` | Site-wide settings — hero copy, banner text, WhatsApp number, policy pages, promo nav slot | super_admin, owner |

### User Accounts & Security

- Supabase Auth — email/password sign-up, sign-in, password reset via email
- Role-based admin access: `super_admin`, `owner`, `employee`
- Row-Level Security (RLS) enforced on every Supabase table
- Users can only read/write their own profile, lists, and orders
- XSS protection via `sanitize.ts` (strips `<script>`, event handlers, `javascript:` URLs from rich text)
- No online payment processing — all orders are confirmed via WhatsApp

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| State | Zustand 4 (cart, lists) + React Context (auth) |
| Backend | Supabase (PostgreSQL, Auth, RLS, Storage) |
| Hosting | Cloudflare Pages (via Wrangler) |
| Styling | CSS custom properties only — no CSS framework, all inline styles in components |
| Fonts | Cormorant Garamond (display), DM Sans (body) |

### No external UI library
All components are hand-built with inline styles and CSS variables defined in `src/styles/tokens.css`. There is no Tailwind, MUI, shadcn, or similar framework.

---

## Project Structure

```
chlea-care/
├── public/
│   ├── chlea-care-logo.svg       # Primary SVG logo (always rendered as <img>)
│   ├── chleacare-icon.svg        # Favicon / icon variant
│   ├── landing-photo.webp        # Hero slide images
│   ├── map-landing.webp
│   └── products-landing.webp
│
├── src/
│   ├── main.tsx                  # App entry point, AuthProvider wrapper
│   ├── App.tsx                   # Route tree (public + admin + subdomain detection)
│   │
│   ├── styles/
│   │   ├── tokens.css            # CSS custom properties (brand colors, spacing, fonts)
│   │   ├── global.css            # Base resets and global element styles
│   │   └── animations.css        # Keyframe animations
│   │
│   ├── types/
│   │   └── database.ts           # TypeScript interfaces for all DB tables + helpers
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx       # React context wrapping useAuth; provides useAuthContext()
│   │
│   ├── hooks/
│   │   ├── useAuth.ts            # Supabase Auth state (user, role, signIn, signUp, signOut)
│   │   ├── useProducts.ts        # Fetch + client-side filter products
│   │   ├── useCart.ts            # Zustand cart store (add, remove, qty, total)
│   │   ├── useLists.ts           # Zustand wishlist store with localStorage persistence
│   │   ├── useSiteSettings.ts    # Fetch site_settings from Supabase with static defaults
│   │   └── useBadges.ts          # Fetch admin-managed badges with session cache
│   │
│   ├── utils/
│   │   ├── supabase.ts           # Supabase client (returns null when env vars missing)
│   │   ├── db.ts                 # Public data-fetch layer with seed-data fallback
│   │   ├── adminApi.ts           # Generic CRUD helpers for admin mutations
│   │   ├── whatsapp.ts           # Build and open WhatsApp order messages
│   │   ├── formatPrice.ts        # formatPrice(n) → "RD$ X,XXX"
│   │   ├── brandFilters.ts       # Filter brands/categories based on live product data
│   │   └── sanitize.ts           # Strip dangerous HTML tags and event attributes
│   │
│   ├── data/
│   │   ├── seedData.ts           # Fallback products, brands, and nav dropdowns
│   │   └── seedBlog.ts           # Fallback blog posts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNav.tsx        # Main navigation bar with brand dropdown and auth
│   │   │   ├── SubBanner.tsx     # Scrolling announcement banner
│   │   │   ├── CategoryNav.tsx   # Horizontal category tabs with DB-driven dropdowns
│   │   │   ├── BottomNav.tsx     # Mobile bottom navigation bar
│   │   │   └── Footer.tsx        # Footer with brands carousel and links
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx    # Slide-out cart panel
│   │   ├── product/
│   │   │   ├── ProductCard.tsx   # Individual product card (grid item)
│   │   │   ├── ProductGrid.tsx   # Responsive product grid with filter bar
│   │   │   ├── ProductModal.tsx  # Product detail modal/lightbox
│   │   │   └── ListPicker.tsx    # "Add to list" dropdown from product card
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx         # Global toast notification system
│   │       ├── Badge.tsx
│   │       ├── Skeleton.tsx
│   │       ├── ImageUploader.tsx # R2-backed image upload for admin
│   │       ├── RichTextEditor.tsx
│   │       ├── BackToTop.tsx
│   │       └── CookieBanner.tsx  # (exists; not currently rendered — no cookies used)
│   │   ├── BrandsCarousel.tsx
│   │   ├── TestimonialsCarousel.tsx
│   │   ├── OrderProcess.tsx      # "How it Works" section
│   │   ├── InstagramModal.tsx    # Instagram post/reel embed modal
│   │   └── WhatsAppFloat.tsx     # Floating WhatsApp CTA button
│   │
│   └── pages/
│       ├── HomePage.tsx
│       ├── CatalogPage.tsx       # /catalogo — main women's product catalog
│       ├── MensCatalogPage.tsx   # /hombres — men's section
│       ├── BrandsPage.tsx        # /marcas — all brands grid
│       ├── BrandPage.tsx         # /marcas/:slug — single brand profile
│       ├── CartPage.tsx          # /carrito — full checkout page
│       ├── AccountPage.tsx       # /cuenta — login/signup + profile management
│       ├── MisListasPage.tsx     # /mis-listas — wishlist management
│       ├── BlogPage.tsx          # /blog — article listing
│       ├── BlogPostPage.tsx      # /blog/:slug — single article
│       ├── PoliticasEnvioPage.tsx
│       ├── PoliticasReembolsoPage.tsx
│       ├── NotFoundPage.tsx
│       └── admin/
│           ├── AdminLayout.tsx   # Shell: sidebar nav, auth guard, role gating
│           ├── AdminLoginPage.tsx
│           ├── AdminDashboard.tsx
│           ├── AdminProductos.tsx
│           ├── AdminMarcas.tsx
│           ├── AdminEtiquetas.tsx
│           ├── AdminBadges.tsx
│           ├── AdminOrdenes.tsx
│           ├── AdminSocial.tsx
│           ├── AdminBlog.tsx
│           ├── AdminTestimonios.tsx
│           ├── AdminNavegacion.tsx
│           └── AdminConfiguracion.tsx
│
├── supabase/
│   └── migration.sql             # Full DB schema with RLS policies
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Cloudflare account (for deployment)

### Installation

```bash
git clone <repo-url>
cd chlea-care
npm install
```

### Local Development

```bash
# Copy the env template and fill in your values
cp .env.example .env.local

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

Admin routes are accessible at `http://localhost:5173/admin/dashboard` during local development.

> **Note:** The site works without Supabase configured. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing, `src/utils/supabase.ts` returns `null` and `src/utils/db.ts` falls back to seed data from `src/data/seedData.ts` and `src/data/seedBlog.ts`. Products, brands, and nav dropdowns will display but orders, auth, and admin panel will not function.

---

## Environment Variables

Create a `.env.local` file at the project root with the following variables. Never commit this file.

```env
# Supabase project URL (from Project Settings > API)
VITE_SUPABASE_URL=

# Supabase anon/public key (from Project Settings > API)
VITE_SUPABASE_ANON_KEY=

# WhatsApp number for order messages (digits only, e.g. 18094517690)
VITE_WA_NUMBER=

# Cloudflare R2 public bucket URL for product images
VITE_R2_BUCKET_URL=
```

All variables are prefixed with `VITE_` so Vite exposes them to the browser bundle. No server-side secrets are used.

---

## Database Setup

The entire schema lives in a single migration file: `supabase/migration.sql`.

**Steps:**

1. Open your Supabase project and go to **SQL Editor** (in the left sidebar)
2. Click **New query**
3. Paste the entire contents of `supabase/migration.sql`
4. Click **Run**

The migration creates all 16 tables with RLS policies, adds post-launch column patches, inserts default badge data, and creates performance indexes. It is safe to run on a fresh database.

### Tables Created

| Table | Purpose |
|---|---|
| `brands` | Brand catalog with logos, slugs, and categories |
| `products` | Product catalog with pricing, badges, labels, images, and brand linkage |
| `admin_users` | Staff accounts linked to Supabase Auth (role: super_admin, owner, employee) |
| `site_settings` | Key-value store for all editable site content |
| `instagram_posts` | Embedded posts and reels for the homepage feed |
| `blog_posts` | Blog articles with rich text body |
| `nav_dropdowns` | Category navigation dropdown link items |
| `user_lists` | Named wishlists belonging to authenticated users |
| `list_items` | Products saved within a user list |
| `whatsapp_orders` | Orders placed via WhatsApp checkout; includes sequential `order_number` |
| `label_groups` | Filter facet groups and their sub-values (e.g. "Tipo de Cabello") |
| `product_reviews` | Per-product reviews by logged-in users |
| `testimonials` | Homepage testimonials (admin-approved before display) |
| `badges` | Admin-managed badge list used in the product form |
| `user_profiles` | Customer profile data: name, phone, avatar, saved addresses |

### Adding an Admin User

After running the migration, create an admin account manually in the Supabase dashboard:

1. Go to **Authentication > Users** and create a new user with an email and password
2. Copy the user's UUID
3. In the **SQL Editor**, run:

```sql
INSERT INTO public.admin_users (id, role, email)
VALUES ('<user-uuid>', 'super_admin', '<email>');
```

---

## Deployment

The project deploys to **Cloudflare Pages** using Wrangler.

```bash
# Build and deploy in one step
npm run deploy

# Or manually
npm run build
npx wrangler deploy
```

The `deploy` script in `package.json` runs `npm run build && npx wrangler deploy`.

### Cloudflare Setup Notes

- Set all `VITE_` environment variables in Cloudflare Pages > Settings > Environment Variables
- The `estudio.chlea.care` subdomain must be configured as an additional domain in the Pages project
- SPA routing requires a `_redirects` file or Cloudflare Pages catch-all rule pointing `/*` to `/index.html`

---

## Changelog

### Phase B — Auth System & Order Linking

- Order records now store `user_id` when the customer is logged in (added `user_id` column + RLS policy to `whatsapp_orders`)
- Checkout form auto-fills name, phone, and default delivery address from the user's saved profile
- Saved addresses are accessible in a dropdown within the checkout delivery section
- Order history tab added to `/cuenta` — shows all past orders with status and item details
- Auto-incrementing `order_number` (human-readable, zero-padded) included in the WhatsApp order message and stored in the DB
- Forgot password / password reset flow via Supabase email link
- `AuthContext` + `useAuthContext()` added so auth state is available globally without prop drilling

### Phase A — Bug Fixes & Catalog Improvements

- Active filter tags now render correctly and clear individual filters without resetting the full state
- Cash-on-delivery (`efectivo`) is correctly disabled for interior delivery at the form level
- Order confirmation screen displays after a successful WhatsApp redirect (cart is cleared; green checkmark shown)
- Navigation dropdowns cleaned up; brand picker in the Marcas dropdown now uses live DB data with no seed fallbacks
- XSS sanitization applied to all rich text content rendered with `dangerouslySetInnerHTML`
- Hero section images preloaded to reduce LCP on initial paint
- Cookie banner removed (no cookies are used by this application)
- Scroll-to-top on every route change via `useEffect` in `App.tsx`

### Cart Drawer Fix

- Cart drawer (`CartDrawer.tsx`) state synced correctly with Zustand store; toggling the cart no longer causes stale state

### Filter Sync Fix

- Catalog page URL query params and internal filter state kept in sync so browser back/forward navigation preserves filter selections

### Hamburger / Mobile Nav Brands Fix

- Mobile hamburger menu's Marcas dropdown now loads brand slugs from the live database correctly

---

## Known Issues / Pending Work

| Issue | Notes |
|---|---|
| Wishlists are client-side only | `user_lists` and `list_items` tables exist in the DB with full RLS policies, but `useLists.ts` uses Zustand + localStorage. Lists are not synced to Supabase and are lost if localStorage is cleared or the user switches devices. |
| No email change flow | The `/cuenta` security tab supports password change but not email address change. Supabase supports this natively but the UI flow has not been built. |
| Cart not persisted to DB | Cart state lives in Zustand (in-memory only). There is no `cart_items` table; the cart is lost on page refresh. By design — the checkout flow writes to `whatsapp_orders` on submit. |
| Bundle size warning | `npm run build` reports a ~715 KB chunk. The app could benefit from route-based code splitting (`React.lazy` + `Suspense`) to reduce initial load, particularly for the admin panel. |
| `CookieBanner.tsx` is unused | The component exists but is not imported or rendered anywhere. Can be deleted if not needed. |
| Product reviews UI | `product_reviews` table and DB functions exist. The `submitProductReview` and `fetchProductReviews` helpers are in `db.ts`. A review submission UI inside `ProductModal.tsx` has not been built yet. |

---

## Contributing

This is a private client project. All development is managed through Adrian Alexander Studio. If you have been granted access:

1. Create a feature branch from `main`
2. Keep all UI copy in Spanish
3. Use `var(--deep)` instead of black/`#000` anywhere a dark color is needed
4. Never commit `.env.local` or any file containing API keys
5. Run `npm run build` before opening a PR to catch TypeScript errors

---

## Credits

Built by **Adrian Alexander Studio** with [Claude Code](https://claude.ai/code) (Anthropic).

- **Developer:** Adrian Alexander
- **Client / Owner:** Denisee Ventura + Cleo Garcia
- **Brand:** Chlea Care — Santo Domingo, Dominican Republic
- **Instagram / TikTok:** [@chlea.carerd](https://instagram.com/chlea.carerd)
