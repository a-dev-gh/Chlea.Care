/**
 * Central data-fetching layer for Chlea Care.
 *
 * Strategy: try Supabase first; if the client is null (env vars missing)
 * or the query fails, fall back to local seed data so the site always works.
 */

import { supabase } from '../utils/supabase';
import {
  SEED_PRODUCTS,
  SEED_BRANDS,
  SEED_NAV_DROPDOWNS,
} from '../data/seedData';
import type {
  Product,
  Brand,
  SiteSettings,
  NavDropdown,
  InstagramPost,
  BlogPost,
  WhatsAppOrder,
  ProductReview,
  Testimonial,
} from '../types/database';

// ---------------------------------------------------------------------------
// Defaults (mirrors useSiteSettings.ts DEFAULTS)
// ---------------------------------------------------------------------------

const SETTINGS_DEFAULTS: SiteSettings = {
  banner_text: 'Envíos disponibles · WhatsApp: +1 (809) 775-6773',
  whatsapp_number: '18094517690',
  hero_tagline: 'Glow Different, Glow Chlea',
  hero_sub: 'Productos premium de cabello, piel y estilo curados para las que exigen más.',
  about_text:
    'Chlea Care nació de un sueño simple: que cada mujer tenga acceso a productos de belleza que realmente funcionen, sin comprometer su bienestar ni su estilo. Aquí cuido cada detalle para que tú brilles.',
  search_featured_labels: 'Tipo de Cabello,Preocupaciones',
  search_price_filter: 'true',
};

// ---------------------------------------------------------------------------
// Seed-data mappers (seed shapes differ slightly from DB types)
// ---------------------------------------------------------------------------

function seedProductsToProducts(): Product[] {
  return SEED_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category as Product['category'],
    badge: p.badge,
    is_hot: p.is_hot,
    sale_percent: p.sale_percent,
    description: p.description,
    // Keep human-readable brand name for display in ProductCard / ProductModal
    brand: p.brand,
    brand_slug: p.brand
      ? p.brand.toLowerCase().replace(/[&\s]+/g, '-').replace(/--+/g, '-')
      : null,
    image_url: p.image_url ?? '',
    image_urls: p.image_urls,
    is_visible: p.is_visible,
    labels: p.labels ?? {},
    created_at: new Date().toISOString(),
  }));
}

// Map brand names to their correct category
const BRAND_CATEGORY_MAP: Record<string, Brand['category']> = {
  'The Ordinary': 'skincare',
  'Tree Hut': 'skincare',
  'Bath & Body Works': 'skincare',
  'Agua de Cielo': 'accessories',
};

function seedBrandsToBrands(): Brand[] {
  return SEED_BRANDS.map((b, i) => ({
    id: String(i + 1),
    name: b.name,
    slug: b.slug,
    tagline: b.tagline,
    logo_url: b.logo,
    is_premier: i < 6,
    category: BRAND_CATEGORY_MAP[b.name] ?? 'hair',
    created_at: new Date().toISOString(),
  }));
}

function seedNavDropdowns(): Record<string, NavDropdown[]> {
  const result: Record<string, NavDropdown[]> = {};
  for (const [slug, items] of Object.entries(SEED_NAV_DROPDOWNS)) {
    result[slug] = items.map((item, i) => ({
      id: `${slug}-${i}`,
      category_slug: slug,
      label: item.label,
      href: item.href,
      sort_order: i,
    }));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Public fetch functions
// ---------------------------------------------------------------------------

/** Fetch all products ordered by created_at desc. */
export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) return seedProductsToProducts();

  const [{ data: prodData, error: prodError }, { data: brandData }] = await Promise.all([
    supabase.from('products').select('*').eq('is_visible', true).order('created_at', { ascending: false }),
    supabase.from('brands').select('name, slug'),
  ]);

  if (prodError || !prodData) {
    console.warn('[db] fetchProducts failed, using seed data:', prodError?.message);
    return seedProductsToProducts();
  }

  // Build slug→name map so product.brand is always a human-readable display name
  const brandMap = new Map<string, string>();
  if (brandData) {
    for (const b of brandData) brandMap.set(b.slug, b.name);
  }

  return (prodData as Product[]).map(p => ({
    ...p,
    brand: p.brand_slug ? (brandMap.get(p.brand_slug) || p.brand_slug) : undefined,
  }));
}

/** Fetch all brands ordered by name. */
export async function fetchBrands(): Promise<Brand[]> {
  if (!supabase) return seedBrandsToBrands();

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.warn('[db] fetchBrands failed, using seed data:', error.message);
    return seedBrandsToBrands();
  }

  return data as Brand[];
}

/** Fetch site settings and merge key-value rows into a SiteSettings object. */
export async function fetchSettings(): Promise<SiteSettings> {
  if (!supabase) return { ...SETTINGS_DEFAULTS };

  const { data, error } = await supabase.from('site_settings').select('*');

  if (error) {
    console.warn('[db] fetchSettings failed, using defaults:', error.message);
    return { ...SETTINGS_DEFAULTS };
  }

  // Merge DB rows on top of defaults so missing keys still have values
  const merged: SiteSettings = { ...SETTINGS_DEFAULTS };
  for (const row of data as { key: string; value: string }[]) {
    (merged as Record<string, string>)[row.key] = row.value;
  }
  return merged;
}

/** Fetch nav dropdowns grouped by category_slug, ordered by sort_order. */
export async function fetchNavDropdowns(): Promise<Record<string, NavDropdown[]>> {
  if (!supabase) return seedNavDropdowns();

  const { data, error } = await supabase
    .from('nav_dropdowns')
    .select('*')
    .order('sort_order');

  if (error) {
    console.warn('[db] fetchNavDropdowns failed, using seed data:', error.message);
    return seedNavDropdowns();
  }

  const grouped: Record<string, NavDropdown[]> = {};
  for (const row of data as NavDropdown[]) {
    if (!grouped[row.category_slug]) grouped[row.category_slug] = [];
    grouped[row.category_slug].push(row);
  }
  return grouped;
}

/** Fetch visible Instagram posts ordered by sort_order. */
export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('instagram_posts')
    .select('*')
    .order('sort_order');

  if (error) {
    console.warn('[db] fetchInstagramPosts failed:', error.message);
    return [];
  }

  return data as InstagramPost[];
}

/** Fetch published blog posts ordered by published_at desc. */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_visible', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.warn('[db] fetchBlogPosts failed:', error.message);
    return [];
  }

  return data as BlogPost[];
}

/** Fetch all WhatsApp orders ordered by created_at desc. */
export async function fetchWhatsAppOrders(): Promise<WhatsAppOrder[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('whatsapp_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[db] fetchWhatsAppOrders failed:', error.message);
    return [];
  }

  return data as WhatsAppOrder[];
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Insert a new WhatsApp order (from cart checkout flow). */
export async function insertOrder(
  order: Omit<WhatsAppOrder, 'id' | 'created_at'>,
): Promise<WhatsAppOrder | null> {
  if (!supabase) {
    console.warn('[db] insertOrder skipped — Supabase not configured.');
    return null;
  }

  const { data, error } = await supabase
    .from('whatsapp_orders')
    .insert(order)
    .select()
    .single();

  if (error) {
    console.warn('[db] insertOrder failed:', error.message);
    return null;
  }

  return data as WhatsAppOrder;
}

// ---------------------------------------------------------------------------
// Product Reviews
// ---------------------------------------------------------------------------

/** Fetch reviews for a specific product, newest first. */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[db] fetchProductReviews failed:', error.message);
    return [];
  }

  return data as ProductReview[];
}

/** Submit a new product review (user must be logged in). */
export async function submitProductReview(
  review: Omit<ProductReview, 'id' | 'created_at'>,
): Promise<ProductReview | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('product_reviews')
    .insert(review)
    .select()
    .single();

  if (error) {
    console.warn('[db] submitProductReview failed:', error.message);
    return null;
  }

  return data as ProductReview;
}

/** Delete a product review (own user or admin). */
export async function deleteProductReview(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('product_reviews').delete().eq('id', id);

  if (error) {
    console.warn('[db] deleteProductReview failed:', error.message);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

/** Fetch approved testimonials for the homepage carousel. */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[db] fetchTestimonials failed:', error.message);
    return [];
  }

  return data as Testimonial[];
}

/** Submit a new testimonial (public, starts unapproved). */
export async function submitTestimonial(
  testimonial: { name: string; rating: number; text: string },
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('testimonials')
    .insert({ ...testimonial, is_approved: false });

  if (error) {
    console.warn('[db] submitTestimonial failed:', error.message);
    return false;
  }

  return true;
}
