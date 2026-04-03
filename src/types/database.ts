/**
 * Supabase Database Types for Chlea Care
 *
 * All tables mirror the Supabase schema.
 * Prices are whole Dominican pesos (no decimals).
 */

// ---------------------------------------------------------------------------
// Enums / Unions
// ---------------------------------------------------------------------------

export type ProductCategory = 'cabello' | 'skincare' | 'accesorios' | 'hombres';

export type BrandCategory = 'hair' | 'skincare' | 'accessories' | 'mens';

export type AdminRole = 'super_admin' | 'owner' | 'employee';

export type InstagramPostType = 'post' | 'reel';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// ---------------------------------------------------------------------------
// Table Interfaces
// ---------------------------------------------------------------------------

/** A product listed in the catalog. */
export interface Product {
  id: string;
  name: string;
  /** Whole Dominican pesos (RD$). Never includes decimals. */
  price: number;
  category: ProductCategory;
  /** Optional badge text shown on the card (e.g. "Nuevo", "Best Seller"). */
  badge: string;
  /** Flagged as a hot / trending product. */
  is_hot: boolean;
  /** Discount percentage (0 when not on sale). */
  sale_percent: number;
  description: string;
  /** Human-readable brand name (used for display). */
  brand?: string;
  /** Slug linking to the brand row. Null for unbranded items. */
  brand_slug: string | null;
  image_url: string;
  /** Optional array of additional product images (max 6). */
  image_urls?: string[];
  /** Hidden products are excluded from the storefront but kept in the DB. */
  is_visible: boolean;
  /**
   * Dynamic filter labels used for faceted search.
   * Keys are human-readable group names; values are tag arrays.
   * Example: `{ "Tipo de Cabello": ["Rizado", "Danado"] }`
   */
  labels: Record<string, string[]>;
  /** Product must be requested/ordered specially — not available off-the-shelf. */
  is_by_request?: boolean;
  /** Whether the product is currently in stock. False = shows "Agotado". */
  is_in_stock?: boolean;
  created_at: string;
}

/** A brand available in the store. */
export interface Brand {
  id: string;
  name: string;
  /** URL-safe unique identifier. */
  slug: string;
  tagline: string;
  logo_url: string;
  /** Only the first 6 premier brands are shown in the footer carousel. */
  is_premier: boolean;
  category: BrandCategory;
  created_at: string;
}

/** An admin / staff user linked to Supabase Auth. */
export interface AdminUser {
  /** References the Supabase auth.users id. */
  id: string;
  role: AdminRole;
  email: string;
  created_at: string;
}

/**
 * Key-value site settings.
 * The `key` column is the primary key (no auto-generated id).
 */
export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

/** An embedded Instagram post or reel displayed on the homepage. */
export interface InstagramPost {
  id: string;
  url: string;
  type: InstagramPostType;
  is_visible: boolean;
  /** Lower numbers appear first. */
  sort_order: number;
  created_at: string;
}

/** A blog article published on the site. */
export interface BlogPost {
  id: string;
  title: string;
  /** URL-safe unique identifier. */
  slug: string;
  category: string;
  excerpt: string;
  /** Full Markdown / HTML body. */
  body: string;
  image_url: string;
  is_visible: boolean;
  /** ISO date string for the publish date (can differ from created_at). */
  published_at: string;
  created_at: string;
}

/** A single entry inside a CategoryNav dropdown menu. */
export interface NavDropdown {
  id: string;
  /** The parent category slug this link belongs to. */
  category_slug: string;
  label: string;
  href: string;
  /** Lower numbers appear first. */
  sort_order: number;
}

/** A named product list (wishlist, favorites, etc.) belonging to a user. */
export interface UserList {
  id: string;
  /** Supabase auth user id. */
  user_id: string;
  name: string;
  created_at: string;
}

/** A product saved inside a UserList. */
export interface ListItem {
  id: string;
  /** References UserList.id */
  list_id: string;
  /** References Product.id */
  product_id: string;
  added_at: string;
}

/** A line item inside a WhatsApp order. */
export interface OrderLineItem {
  id: string;
  name: string;
  /** Whole Dominican pesos. */
  price: number;
  quantity: number;
}

/** An order placed via WhatsApp checkout. */
export interface WhatsAppOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: OrderLineItem[];
  /** Order total in whole Dominican pesos. */
  total: number;
  status: OrderStatus;
  created_at: string;
}

/** A product review left by a logged-in user. */
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  text: string;
  created_at: string;
}

/** A homepage testimonial submitted by a visitor (admin-approved). */
export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  photo_url: string;
  is_approved: boolean;
  created_at: string;
}

/** An admin-managed badge (e.g. "Bestseller 🏆"). */
export interface BadgeEntry {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
  created_at: string;
}

/** A label group for catalog filters (e.g. "Tipo de Cabello" with values ["Rizado", "Lacio"]). */
export interface LabelGroup {
  id: string;
  /** Human-readable group name. */
  name: string;
  /** Array of sub-values within this group. */
  values: string[];
  sort_order: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Display shape — minimal type for product cards / modal / grids.
// Both SeedProduct and the full DB Product satisfy this interface.
// ---------------------------------------------------------------------------

export interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  badge: string;
  is_hot: boolean;
  sale_percent: number;
  description: string;
  brand?: string;
  image_url?: string;
  image_urls?: string[];
  is_visible: boolean;
  labels?: Record<string, string[]>;
  /** Product must be requested via WhatsApp — not add-to-cart. */
  is_by_request?: boolean;
  /** Whether the product is currently in stock. */
  is_in_stock?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Union of all Supabase table names (snake_case, as stored in the DB). */
export type TableName =
  | 'products'
  | 'brands'
  | 'admin_users'
  | 'site_settings'
  | 'instagram_posts'
  | 'blog_posts'
  | 'nav_dropdowns'
  | 'user_lists'
  | 'list_items'
  | 'whatsapp_orders'
  | 'label_groups'
  | 'product_reviews'
  | 'testimonials'
  | 'badges';

/**
 * Typed map of all known site-setting keys.
 * Every property is optional because any key may not yet exist in the DB.
 */
export interface SiteSettings {
  /** Scrolling announcement banner text. */
  banner_text?: string;
  /** WhatsApp number used for checkout messages (digits only). */
  whatsapp_number?: string;
  /** Main hero headline. */
  hero_tagline?: string;
  /** Hero sub-headline / supporting text. */
  hero_sub?: string;
  /** "About Chlea Care" section body copy. */
  about_text?: string;
  /** Pre-filled greeting for the WhatsApp checkout message. */
  whatsapp_greeting?: string;
  /** Comma-separated label names surfaced as featured filters in search. */
  search_featured_labels?: string;
  /** JSON-encoded price range config for the search price slider. */
  search_price_filter?: string;
  /** Shipping policy page content (plain text with **bold** and paragraph breaks). */
  politicas_envio?: string;
  /** Refund policy page content (plain text with **bold** and paragraph breaks). */
  politicas_reembolso?: string;
  /** Promotional nav slot — display name (e.g. "Ofertas", "Verano"). */
  promo_nav_name?: string;
  /** Promotional nav slot — target URL (e.g. "/catalogo?oferta=true"). */
  promo_nav_href?: string;
  /** Promotional nav slot — emoji icon for the pill. */
  promo_nav_emoji?: string;
}
