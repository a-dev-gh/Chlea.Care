-- ==========================================================================
-- Chlea Care  --  Seed Data
-- Run AFTER migration.sql in the Supabase SQL Editor.
-- ==========================================================================

-- =========================================================================
-- BRANDS  (18 brands — first 6 are premier)
-- =========================================================================
INSERT INTO public.brands (name, slug, tagline, logo_url, is_premier, category) VALUES
  ('Davines',           'davines',           'Belleza sostenible de Italia',             '/brand logos/davines-logo.webp',          true,  'hair'),
  ('Alfaparf Milano',   'alfaparf-milano',   'Profesional italiano de alto rendimiento', '/brand logos/alfaparf-logo.webp',         true,  'hair'),
  ('Lola Cosmetics',    'lola-cosmetics',    'Cuidado capilar brasileno',                '/brand logos/lola-logo.webp',             true,  'hair'),
  ('Boe Cosmetics',     'boe-cosmetics',     'Tratamientos capilares especializados',    '/brand logos/boe-logo.webp',              true,  'hair'),
  ('Salerm Cosmetics',  'salerm-cosmetics',  'Cosmetica profesional espanola',           '/brand logos/salerm-logo.webp',           true,  'hair'),
  ('Mielle Organics',   'mielle-organics',   'Natural y organico para rizos',            '/brand logos/mielle-logo.webp',           true,  'hair'),
  ('Agua de Cielo',     'agua-de-cielo',     'Fragancias dominicanas',                   '/brand logos/agua-logo.webp',             false, 'accessories'),
  ('Difeel',            'difeel',            'Aceites naturales para el cabello',        '/brand logos/difeel-logo.webp',           false, 'hair'),
  ('OGX',               'ogx',               'Belleza inspirada en la naturaleza',       '/brand logos/ogx-logo.webp',              false, 'hair'),
  ('Got2b Glued',       'got2b-glued',       'Fijacion de alto impacto',                 '/brand logos/got2b-logo.webp',            false, 'hair'),
  ('Tree Hut',          'tree-hut',          'Body care natural y delicioso',            '/brand logos/treehut-logo.webp',          false, 'skincare'),
  ('Skala Expert',      'skala-expert',      'Cuidado capilar accesible',               '/brand logos/skala-logo.webp',            false, 'hair'),
  ('Endoten Control',   'endoten-control',   'Control capilar profesional',              '/brand logos/logo-endoten-black.webp',    false, 'hair'),
  ('The Ordinary',      'the-ordinary',      'Skincare clinico sin complicaciones',      '/brand logos/the-ordinary-logo.webp',     false, 'skincare'),
  ('Dove',              'dove',              'Belleza real, cuidado real',               '/brand logos/dove-logo.webp',             false, 'hair'),
  ('Karseell',          'karseell',          'Reparacion con colageno',                  '/brand logos/karseel-logo.webp',          false, 'hair'),
  ('Olaplex',           'olaplex',           'Ciencia que repara enlaces',               '/brand logos/Olaplex-Logo.webp',          false, 'hair'),
  ('Bath & Body Works', 'bath-body-works',   'Body care premium americano',              '/brand logos/bbw-logo.webp',              false, 'skincare');


-- =========================================================================
-- PRODUCTS  (18 products)
-- =========================================================================
INSERT INTO public.products (name, price, category, badge, is_hot, sale_percent, description, brand_slug, image_url, is_visible, labels) VALUES
  (
    'OI All In One Milk', 1850, 'cabello', 'Bestseller', true, 0,
    'Tratamiento multi-beneficio que desenreda, hidrata, protege del calor y anade brillo.',
    'davines', '', true,
    '{"Tipo de Cabello": ["Todo Tipo"], "Preocupaciones": ["Frizz", "Dano por Calor"]}'::jsonb
  ),
  (
    'Semi Di Lino Diamond Illuminating Mask', 1350, 'cabello', 'Nuevo', true, 0,
    'Mascarilla iluminadora con micro-cristales de diamante para un brillo espectacular.',
    'alfaparf-milano', '', true,
    '{"Tipo de Cabello": ["Normal", "Opaco"], "Preocupaciones": ["Falta de Brillo"]}'::jsonb
  ),
  (
    'Dream Cream Mascara', 780, 'cabello', 'Top Rated', true, 50,
    'Super mascarilla para cabellos danados con manteca de murumuru y aceite de coco.',
    'lola-cosmetics', '', true,
    '{"Tipo de Cabello": ["Rizado", "Danado"], "Preocupaciones": ["Sequedad", "Frizz"]}'::jsonb
  ),
  (
    'Niacinamide 10% + Zinc 1%', 680, 'skincare', 'Viral', true, 0,
    'Serum de alta concentracion para reducir la apariencia de poros y marcas.',
    'the-ordinary', '', true,
    '{"Tipo de Piel": ["Grasa", "Mixta"], "Preocupaciones": ["Poros", "Manchas"]}'::jsonb
  ),
  (
    'Pomegranate & Honey Leave-In Conditioner', 950, 'cabello', '', false, 0,
    'Leave-in hidratante que fortalece y protege el cabello rizado.',
    'mielle-organics', '', true,
    '{"Tipo de Cabello": ["Rizado", "Afro"], "Preocupaciones": ["Sequedad"]}'::jsonb
  ),
  (
    'Argan Oil of Morocco Shampoo', 520, 'cabello', '', false, 0,
    'Shampoo con aceite de argan para restaurar fuerza y brillo.',
    'ogx', '', true,
    '{"Tipo de Cabello": ["Todo Tipo"], "Preocupaciones": ["Falta de Brillo"]}'::jsonb
  ),
  (
    'Karseell Collagen Hair Mask', 650, 'cabello', 'Bestseller', false, 0,
    'Mascarilla de colageno para reparacion profunda y brillo natural.',
    'karseell', '', true,
    '{"Tipo de Cabello": ["Danado", "Procesado"], "Preocupaciones": ["Dano Quimico", "Sequedad"]}'::jsonb
  ),
  (
    'Tropic Isle Jamaican Black Castor Oil', 720, 'cabello', '', false, 0,
    'Aceite de ricino jamaiquino para estimular el crecimiento y fortalecer el cabello.',
    'difeel', '', true,
    '{"Tipo de Cabello": ["Todo Tipo"], "Preocupaciones": ["Caida", "Crecimiento"]}'::jsonb
  ),
  (
    'No. 3 Hair Perfector', 2200, 'cabello', 'Top Rated', true, 0,
    'Tratamiento pre-shampoo que reduce la rotura y fortalece el cabello desde dentro.',
    'olaplex', '', true,
    '{"Tipo de Cabello": ["Danado", "Con Color"], "Preocupaciones": ["Dano Quimico", "Rotura"]}'::jsonb
  ),
  (
    'Coco Expert Mascarilla', 480, 'cabello', '', false, 0,
    'Mascarilla de aceite de coco para nutricion intensa y cabello suave.',
    'skala-expert', '', true,
    '{"Tipo de Cabello": ["Seco", "Normal"], "Preocupaciones": ["Sequedad"]}'::jsonb
  ),
  (
    'Spiking Glue', 450, 'hombres', 'Hot', true, 0,
    'Gel de fijacion extrema resistente al agua para estilos que duran todo el dia.',
    'got2b-glued', '', true,
    '{"Tipo de Cabello": ["Todo Tipo"], "Uso": ["Fijacion"]}'::jsonb
  ),
  (
    'Agua de Colonia Fresca', 580, 'hombres', '', false, 0,
    'Fragancia fresca y duradera con notas citricas y amaderadas.',
    'agua-de-cielo', '', true,
    '{"Tipo": ["Fragancia"]}'::jsonb
  ),
  (
    'Coconut Butter Body Scrub', 890, 'skincare', 'Bestseller', false, 0,
    'Exfoliante corporal de manteca de coco para una piel suave y luminosa.',
    'tree-hut', '', true,
    '{"Tipo de Piel": ["Todo Tipo"], "Preocupaciones": ["Textura", "Hidratacion"]}'::jsonb
  ),
  (
    'Intensive Repair Shampoo', 750, 'cabello', '', false, 30,
    'Shampoo reparador intensivo para cabellos maltratados y procesados.',
    'dove', '', true,
    '{"Tipo de Cabello": ["Danado"], "Preocupaciones": ["Dano Quimico"]}'::jsonb
  ),
  (
    'Keratina Brasilena', 1100, 'cabello', 'Nuevo', false, 0,
    'Tratamiento de keratina alisante para un cabello liso y manejable.',
    'boe-cosmetics', '', true,
    '{"Tipo de Cabello": ["Rizado", "Ondulado"], "Preocupaciones": ["Frizz", "Alisado"]}'::jsonb
  ),
  (
    'Hydra Rescue Conditioner', 620, 'cabello', '', false, 0,
    'Acondicionador de hidratacion profunda con complejo de vitaminas.',
    'salerm-cosmetics', '', true,
    '{"Tipo de Cabello": ["Seco", "Normal"], "Preocupaciones": ["Sequedad"]}'::jsonb
  ),
  (
    'A Thousand Wishes Body Lotion', 1350, 'skincare', '', false, 0,
    'Locion corporal con fragancia iconica de champan rosa, frambuesa dorada y crema de almizcle.',
    'bath-body-works', '', true,
    '{"Tipo de Piel": ["Todo Tipo"], "Preocupaciones": ["Hidratacion"]}'::jsonb
  ),
  (
    'Endoten Control Capilar', 980, 'cabello', 'Nuevo', false, 0,
    'Tratamiento de control capilar para alisar y manejar el cabello rebelde.',
    'endoten-control', '', true,
    '{"Tipo de Cabello": ["Rizado", "Rebelde"], "Preocupaciones": ["Frizz", "Alisado"]}'::jsonb
  );


-- =========================================================================
-- SITE_SETTINGS  (6 default key-value pairs)
-- =========================================================================
INSERT INTO public.site_settings (key, value) VALUES
  ('banner_text',       'Envio gratis en pedidos sobre RD$ 3,000'),
  ('whatsapp_number',   '18097756773'),
  ('hero_tagline',      'Tu belleza, Tu poder'),
  ('hero_sub',          'Productos premium de belleza seleccionados para ti. Desde Republica Dominicana para el mundo.'),
  ('about_text',        'Chlea Care nacio de un sueno simple: que cada mujer tenga acceso a productos de belleza que realmente funcionen, sin comprometer su bienestar ni su estilo. Aqui cuido cada detalle para que tu brilles.'),
  ('whatsapp_greeting', 'Hola! Me gustaria ordenar:');


-- =========================================================================
-- INSTAGRAM_POSTS  (3 posts from HomePage)
-- =========================================================================
INSERT INTO public.instagram_posts (url, type, is_visible, sort_order) VALUES
  ('https://www.instagram.com/p/DWEnZb4jn5w/', 'post', true, 1),
  ('https://www.instagram.com/p/DPo41_dDkWh/', 'reel', true, 2),
  ('https://www.instagram.com/p/DGmNg0PPvCM/', 'post', true, 3);


-- =========================================================================
-- NAV_DROPDOWNS  (5 categories with their sub-links)
-- =========================================================================
INSERT INTO public.nav_dropdowns (category_slug, label, href, sort_order) VALUES
  -- Cabello
  ('cabello', 'Shampoo & Acondicionador',   '/catalogo?categoria=cabello&etiqueta=shampoo',     1),
  ('cabello', 'Mascarillas & Tratamientos',  '/catalogo?categoria=cabello&etiqueta=mascarillas',  2),
  ('cabello', 'Aceites & Serums',            '/catalogo?categoria=cabello&etiqueta=aceites',      3),
  ('cabello', 'Leave-In & Styling',          '/catalogo?categoria=cabello&etiqueta=styling',      4),
  ('cabello', 'Color & Tintes',              '/catalogo?categoria=cabello&etiqueta=color',        5),
  -- Skincare
  ('skincare', 'Limpieza',                   '/catalogo?categoria=skincare&etiqueta=limpieza',     1),
  ('skincare', 'Serums & Tratamientos',      '/catalogo?categoria=skincare&etiqueta=serums',       2),
  ('skincare', 'Hidratantes',                '/catalogo?categoria=skincare&etiqueta=hidratantes',   3),
  ('skincare', 'Exfoliantes & Scrubs',       '/catalogo?categoria=skincare&etiqueta=exfoliantes',  4),
  ('skincare', 'Body Care',                  '/catalogo?categoria=skincare&etiqueta=bodycare',      5),
  -- Accesorios
  ('accesorios', 'Herramientas de Cabello',  '/catalogo?categoria=accesorios&etiqueta=herramientas', 1),
  ('accesorios', 'Brochas & Aplicadores',    '/catalogo?categoria=accesorios&etiqueta=brochas',      2),
  ('accesorios', 'Organizadores',            '/catalogo?categoria=accesorios&etiqueta=organizadores', 3),
  -- Marcas
  ('marcas', 'Davines',                      '/marcas/davines',          1),
  ('marcas', 'Alfaparf Milano',              '/marcas/alfaparf-milano',  2),
  ('marcas', 'Olaplex',                      '/marcas/olaplex',          3),
  ('marcas', 'The Ordinary',                 '/marcas/the-ordinary',     4),
  ('marcas', 'Lola Cosmetics',               '/marcas/lola-cosmetics',   5),
  -- Ofertas
  ('ofertas', 'Hasta 30% Off',               '/catalogo?filtro=oferta&descuento=30',       1),
  ('ofertas', 'Hasta 50% Off',               '/catalogo?filtro=oferta&descuento=50',       2),
  ('ofertas', 'Combos & Sets',               '/catalogo?filtro=oferta&etiqueta=combos',    3);
