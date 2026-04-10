-- ==========================================================================
-- Chlea Care  --  Supabase Migration
-- Run this entire file in the Supabase SQL Editor (or via psql).
-- ==========================================================================

-- -------------------------------------------------------------------------
-- 0. Helper: is_admin function (reused by many RLS policies)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$;


-- =========================================================================
-- 1. BRANDS
-- =========================================================================
CREATE TABLE public.brands (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  tagline    text NOT NULL DEFAULT '',
  logo_url   text NOT NULL DEFAULT '',
  is_premier boolean NOT NULL DEFAULT false,
  category   text NOT NULL DEFAULT 'hair',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands: public read"
  ON public.brands FOR SELECT
  USING (true);

CREATE POLICY "brands: admin insert"
  ON public.brands FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "brands: admin update"
  ON public.brands FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "brands: admin delete"
  ON public.brands FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- 2. PRODUCTS
-- =========================================================================
CREATE TABLE public.products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  price        integer NOT NULL DEFAULT 0,
  category     text NOT NULL DEFAULT 'cabello',
  badge        text NOT NULL DEFAULT '',
  is_hot       boolean NOT NULL DEFAULT false,
  sale_percent integer NOT NULL DEFAULT 0,
  description  text NOT NULL DEFAULT '',
  brand_slug   text REFERENCES public.brands(slug) ON DELETE SET NULL,
  image_url    text NOT NULL DEFAULT '',
  is_visible   boolean NOT NULL DEFAULT true,
  labels       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products: public read"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products: admin insert"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "products: admin update"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "products: admin delete"
  ON public.products FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- 3. ADMIN_USERS
-- =========================================================================
CREATE TABLE public.admin_users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'employee',
  email      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT admin_users_role_check
    CHECK (role IN ('super_admin', 'owner', 'employee'))
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own admin row
CREATE POLICY "admin_users: read own row"
  ON public.admin_users FOR SELECT
  USING (id = auth.uid());


-- =========================================================================
-- 4. SITE_SETTINGS
-- =========================================================================
CREATE TABLE public.site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings: public read"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings: admin insert"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "site_settings: admin update"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "site_settings: admin delete"
  ON public.site_settings FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- 5. INSTAGRAM_POSTS
-- =========================================================================
CREATE TABLE public.instagram_posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url        text NOT NULL,
  type       text NOT NULL DEFAULT 'post',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT instagram_posts_type_check
    CHECK (type IN ('post', 'reel'))
);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_posts: public read"
  ON public.instagram_posts FOR SELECT
  USING (true);

CREATE POLICY "instagram_posts: admin insert"
  ON public.instagram_posts FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "instagram_posts: admin update"
  ON public.instagram_posts FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "instagram_posts: admin delete"
  ON public.instagram_posts FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- 6. BLOG_POSTS
-- =========================================================================
CREATE TABLE public.blog_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  category     text NOT NULL DEFAULT '',
  excerpt      text NOT NULL DEFAULT '',
  body         text NOT NULL DEFAULT '',
  image_url    text NOT NULL DEFAULT '',
  is_visible   boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts: public read"
  ON public.blog_posts FOR SELECT
  USING (true);

CREATE POLICY "blog_posts: admin insert"
  ON public.blog_posts FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "blog_posts: admin update"
  ON public.blog_posts FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "blog_posts: admin delete"
  ON public.blog_posts FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- 7. NAV_DROPDOWNS
-- =========================================================================
CREATE TABLE public.nav_dropdowns (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL,
  label         text NOT NULL,
  href          text NOT NULL,
  sort_order    integer NOT NULL DEFAULT 0
);

ALTER TABLE public.nav_dropdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nav_dropdowns: public read"
  ON public.nav_dropdowns FOR SELECT
  USING (true);

CREATE POLICY "nav_dropdowns: admin insert"
  ON public.nav_dropdowns FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "nav_dropdowns: admin update"
  ON public.nav_dropdowns FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "nav_dropdowns: admin delete"
  ON public.nav_dropdowns FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- 8. USER_LISTS
-- =========================================================================
CREATE TABLE public.user_lists (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT 'Favoritos',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_lists: own select"
  ON public.user_lists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_lists: own insert"
  ON public.user_lists FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_lists: own update"
  ON public.user_lists FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "user_lists: own delete"
  ON public.user_lists FOR DELETE
  USING (user_id = auth.uid());


-- =========================================================================
-- 9. LIST_ITEMS
-- =========================================================================
CREATE TABLE public.list_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    uuid NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT list_items_unique UNIQUE (list_id, product_id)
);

ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Helper: user owns the parent list
CREATE POLICY "list_items: own select"
  ON public.list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_lists
      WHERE user_lists.id = list_items.list_id
        AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items: own insert"
  ON public.list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_lists
      WHERE user_lists.id = list_items.list_id
        AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items: own update"
  ON public.list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_lists
      WHERE user_lists.id = list_items.list_id
        AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items: own delete"
  ON public.list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_lists
      WHERE user_lists.id = list_items.list_id
        AND user_lists.user_id = auth.uid()
    )
  );


-- =========================================================================
-- 10. WHATSAPP_ORDERS
-- =========================================================================
CREATE TABLE public.whatsapp_orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name  text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  items          jsonb NOT NULL DEFAULT '[]'::jsonb,
  total          integer NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'pending',
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT whatsapp_orders_status_check
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

ALTER TABLE public.whatsapp_orders ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can create an order
CREATE POLICY "whatsapp_orders: public insert"
  ON public.whatsapp_orders FOR INSERT
  WITH CHECK (true);

-- Only admins can view orders
CREATE POLICY "whatsapp_orders: admin select"
  ON public.whatsapp_orders FOR SELECT
  USING (public.is_admin());

-- Only admins can update orders (change status, etc.)
CREATE POLICY "whatsapp_orders: admin update"
  ON public.whatsapp_orders FOR UPDATE
  USING (public.is_admin());


-- =========================================================================
-- 11. LABEL_GROUPS (main label categories + sub-values for catalog filters)
-- =========================================================================
CREATE TABLE public.label_groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  values     jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.label_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "label_groups: public read"
  ON public.label_groups FOR SELECT
  USING (true);

CREATE POLICY "label_groups: admin insert"
  ON public.label_groups FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "label_groups: admin update"
  ON public.label_groups FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "label_groups: admin delete"
  ON public.label_groups FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- 12. Product columns added post-launch
-- =========================================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_urls   jsonb   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_in_stock  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_by_request boolean NOT NULL DEFAULT false;

-- Brand multi-category support
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS categories jsonb NOT NULL DEFAULT '[]'::jsonb;


-- =========================================================================
-- 13. PRODUCT_REVIEWS (per-product, requires login)
-- =========================================================================
CREATE TABLE public.product_reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name  text NOT NULL DEFAULT '',
  rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text       text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "product_reviews: public read"
  ON public.product_reviews FOR SELECT
  USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "product_reviews: own insert"
  ON public.product_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own reviews, admins can delete any
CREATE POLICY "product_reviews: own or admin delete"
  ON public.product_reviews FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());


-- =========================================================================
-- 14. TESTIMONIALS (homepage, admin-approved)
-- =========================================================================
CREATE TABLE public.testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  rating      integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text        text NOT NULL,
  photo_url   text NOT NULL DEFAULT '',
  is_approved boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can only see approved testimonials
CREATE POLICY "testimonials: public read approved"
  ON public.testimonials FOR SELECT
  USING (is_approved = true OR public.is_admin());

-- Anyone (including anon) can submit a testimonial
CREATE POLICY "testimonials: public insert"
  ON public.testimonials FOR INSERT
  WITH CHECK (true);

-- Only admins can update (approve/reject)
CREATE POLICY "testimonials: admin update"
  ON public.testimonials FOR UPDATE
  USING (public.is_admin());

-- Only admins can delete
CREATE POLICY "testimonials: admin delete"
  ON public.testimonials FOR DELETE
  USING (public.is_admin());


-- =========================================================================
-- INDEXES (optional but recommended)
-- =========================================================================
-- =========================================================================
-- 15. BADGES (admin-managed, used in product form dropdown)
-- =========================================================================
CREATE TABLE public.badges (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  emoji      text NOT NULL DEFAULT '',
  color      text NOT NULL DEFAULT '#EB1982',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges: public read" ON public.badges FOR SELECT USING (true);
CREATE POLICY "badges: admin insert" ON public.badges FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "badges: admin update" ON public.badges FOR UPDATE USING (public.is_admin());
CREATE POLICY "badges: admin delete" ON public.badges FOR DELETE USING (public.is_admin());

INSERT INTO public.badges (name, emoji, sort_order) VALUES
  ('Nuevo', '✦', 1), ('Bestseller', '🏆', 2), ('Oferta', '🔥', 3),
  ('Vegano', '🌿', 4), ('Sin Crueldad', '🐰', 5), ('Top Rated', '⭐', 6), ('Viral', '🔥', 7)
ON CONFLICT (name) DO NOTHING;


-- =========================================================================
-- 16. USER_PROFILES (customer account data)
-- =========================================================================
CREATE TABLE public.user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  avatar_url  text NOT NULL DEFAULT '',
  addresses   jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY "user_profiles: own select"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "user_profiles: own insert"
  ON public.user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles: own update"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can view all profiles (for order management)
CREATE POLICY "user_profiles: admin select"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin());


CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user    ON public.product_reviews(user_id);
CREATE INDEX idx_testimonials_approved   ON public.testimonials(is_approved);
CREATE INDEX idx_products_brand_slug ON public.products(brand_slug);
CREATE INDEX idx_products_category   ON public.products(category);
CREATE INDEX idx_products_is_visible ON public.products(is_visible);
CREATE INDEX idx_user_lists_user_id  ON public.user_lists(user_id);
CREATE INDEX idx_list_items_list_id  ON public.list_items(list_id);
CREATE INDEX idx_nav_dropdowns_cat   ON public.nav_dropdowns(category_slug);
CREATE INDEX idx_instagram_sort      ON public.instagram_posts(sort_order);
CREATE INDEX idx_whatsapp_status     ON public.whatsapp_orders(status);


-- =========================================================================
-- 17. LINK ORDERS TO AUTHENTICATED USERS
-- =========================================================================
-- Add user_id to whatsapp_orders (nullable for anonymous/guest orders)
ALTER TABLE public.whatsapp_orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_user_id ON public.whatsapp_orders(user_id);

-- Allow authenticated users to SELECT their own orders
CREATE POLICY "whatsapp_orders: user select own"
  ON public.whatsapp_orders FOR SELECT
  USING (user_id = auth.uid());

-- Human-readable sequential order number (auto-increments)
ALTER TABLE public.whatsapp_orders
  ADD COLUMN IF NOT EXISTS order_number serial;
