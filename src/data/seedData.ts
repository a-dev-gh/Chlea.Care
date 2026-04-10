export interface SeedCategory {
  name: string;
  slug: string;
  is_men: boolean;
  sort_order: number;
}

export interface SeedProduct {
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
  /** Optional array of additional product images (max 6). */
  image_urls?: string[];
  is_visible: boolean;
  /** Dynamic filter labels — key is the group name, values are the tags */
  labels?: Record<string, string[]>;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { name: 'Cabello',    slug: 'cabello',    is_men: false, sort_order: 1 },
  { name: 'Skincare',   slug: 'skincare',   is_men: false, sort_order: 2 },
  { name: 'Accesorios', slug: 'accesorios', is_men: false, sort_order: 3 },
  { name: 'Hombres',    slug: 'hombres',    is_men: true,  sort_order: 4 },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: '1', name: 'OI All In One Milk', price: 1850, category: 'cabello',
    badge: 'Bestseller', is_hot: true, sale_percent: 0, is_visible: true,
    description: 'Tratamiento multi-beneficio que desenreda, hidrata, protege del calor y añade brillo.',
    brand: 'Davines',
    labels: { 'Tipo de Cabello': ['Todo Tipo'], 'Preocupaciones': ['Frizz', 'Daño por Calor'] },
  },
  {
    id: '2', name: 'Semi Di Lino Diamond Illuminating Mask', price: 1350, category: 'cabello',
    badge: 'Nuevo', is_hot: true, sale_percent: 0, is_visible: true,
    description: 'Mascarilla iluminadora con micro-cristales de diamante para un brillo espectacular.',
    brand: 'Alfaparf Milano',
    labels: { 'Tipo de Cabello': ['Normal', 'Opaco'], 'Preocupaciones': ['Falta de Brillo'] },
  },
  {
    id: '3', name: 'Dream Cream Máscara', price: 780, category: 'cabello',
    badge: 'Top Rated', is_hot: true, sale_percent: 50, is_visible: true,
    description: 'Super mascarilla para cabellos dañados con manteca de murumuru y aceite de coco.',
    brand: 'Lola Cosmetics',
    labels: { 'Tipo de Cabello': ['Rizado', 'Dañado'], 'Preocupaciones': ['Sequedad', 'Frizz'] },
  },
  {
    id: '4', name: 'Niacinamide 10% + Zinc 1%', price: 680, category: 'skincare',
    badge: 'Viral', is_hot: true, sale_percent: 0, is_visible: true,
    description: 'Sérum de alta concentración para reducir la apariencia de poros y marcas.',
    brand: 'The Ordinary',
    labels: { 'Tipo de Piel': ['Grasa', 'Mixta'], 'Preocupaciones': ['Poros', 'Manchas'] },
  },
  {
    id: '5', name: 'Pomegranate & Honey Leave-In Conditioner', price: 950, category: 'cabello',
    badge: '', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Leave-in hidratante que fortalece y protege el cabello rizado.',
    brand: 'Mielle Organics',
    labels: { 'Tipo de Cabello': ['Rizado', 'Afro'], 'Preocupaciones': ['Sequedad'] },
  },
  {
    id: '6', name: 'Argan Oil of Morocco Shampoo', price: 520, category: 'cabello',
    badge: '', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Shampoo con aceite de argán para restaurar fuerza y brillo.',
    brand: 'OGX',
    labels: { 'Tipo de Cabello': ['Todo Tipo'], 'Preocupaciones': ['Falta de Brillo'] },
  },
  {
    id: '7', name: 'Karseell Collagen Hair Mask', price: 650, category: 'cabello',
    badge: 'Bestseller', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Mascarilla de colágeno para reparación profunda y brillo natural.',
    brand: 'Karseell',
    labels: { 'Tipo de Cabello': ['Dañado', 'Procesado'], 'Preocupaciones': ['Daño Químico', 'Sequedad'] },
  },
  {
    id: '8', name: 'Tropic Isle Jamaican Black Castor Oil', price: 720, category: 'cabello',
    badge: '', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Aceite de ricino jamaiquino para estimular el crecimiento y fortalecer el cabello.',
    brand: 'Difeel',
    labels: { 'Tipo de Cabello': ['Todo Tipo'], 'Preocupaciones': ['Caída', 'Crecimiento'] },
  },
  {
    id: '9', name: 'No. 3 Hair Perfector', price: 2200, category: 'cabello',
    badge: 'Top Rated', is_hot: true, sale_percent: 0, is_visible: true,
    description: 'Tratamiento pre-shampoo que reduce la rotura y fortalece el cabello desde dentro.',
    brand: 'Olaplex',
    labels: { 'Tipo de Cabello': ['Dañado', 'Con Color'], 'Preocupaciones': ['Daño Químico', 'Rotura'] },
  },
  {
    id: '10', name: 'Coco Expert Mascarilla', price: 480, category: 'cabello',
    badge: '', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Mascarilla de aceite de coco para nutrición intensa y cabello suave.',
    brand: 'Skala Expert',
    labels: { 'Tipo de Cabello': ['Seco', 'Normal'], 'Preocupaciones': ['Sequedad'] },
  },
  {
    id: '11', name: 'Spiking Glue', price: 450, category: 'hombres',
    badge: 'Hot', is_hot: true, sale_percent: 0, is_visible: true,
    description: 'Gel de fijación extrema resistente al agua para estilos que duran todo el día.',
    brand: 'Got2b Glued',
    labels: { 'Tipo de Cabello': ['Todo Tipo'], 'Uso': ['Fijación'] },
  },
  {
    id: '12', name: 'Agua de Colonia Fresca', price: 580, category: 'hombres',
    badge: '', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Fragancia fresca y duradera con notas cítricas y amaderadas.',
    brand: 'Agua de Cielo',
    labels: { 'Tipo': ['Fragancia'] },
  },
  {
    id: '13', name: 'Coconut Butter Body Scrub', price: 890, category: 'skincare',
    badge: 'Bestseller', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Exfoliante corporal de manteca de coco para una piel suave y luminosa.',
    brand: 'Tree Hut',
    labels: { 'Tipo de Piel': ['Todo Tipo'], 'Preocupaciones': ['Textura', 'Hidratación'] },
  },
  {
    id: '14', name: 'Intensive Repair Shampoo', price: 750, category: 'cabello',
    badge: '', is_hot: false, sale_percent: 30, is_visible: true,
    description: 'Shampoo reparador intensivo para cabellos maltratados y procesados.',
    brand: 'Dove',
    labels: { 'Tipo de Cabello': ['Dañado'], 'Preocupaciones': ['Daño Químico'] },
  },
  {
    id: '15', name: 'Keratina Brasileña', price: 1100, category: 'cabello',
    badge: 'Nuevo', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Tratamiento de keratina alisante para un cabello liso y manejable.',
    brand: 'Boe Cosmetics',
    labels: { 'Tipo de Cabello': ['Rizado', 'Ondulado'], 'Preocupaciones': ['Frizz', 'Alisado'] },
  },
  {
    id: '16', name: 'Hydra Rescue Conditioner', price: 620, category: 'cabello',
    badge: '', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Acondicionador de hidratación profunda con complejo de vitaminas.',
    brand: 'Salerm Cosmetics',
    labels: { 'Tipo de Cabello': ['Seco', 'Normal'], 'Preocupaciones': ['Sequedad'] },
  },
  {
    id: '17', name: 'A Thousand Wishes Body Lotion', price: 1350, category: 'skincare',
    badge: '', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Loción corporal con fragancia icónica de champán rosa, frambuesa dorada y crema de almizcle.',
    brand: 'Bath & Body Works',
    labels: { 'Tipo de Piel': ['Todo Tipo'], 'Preocupaciones': ['Hidratación'] },
  },
  {
    id: '18', name: 'Endoten Control Capilar', price: 980, category: 'cabello',
    badge: 'Nuevo', is_hot: false, sale_percent: 0, is_visible: true,
    description: 'Tratamiento de control capilar para alisar y manejar el cabello rebelde.',
    brand: 'Endoten Control',
    labels: { 'Tipo de Cabello': ['Rizado', 'Rebelde'], 'Preocupaciones': ['Frizz', 'Alisado'] },
  },
];

export const SEED_BRANDS = [
  { name: 'Davines',           slug: 'davines',           tagline: 'Belleza sostenible de Italia',             logo: '/brand logos/davines-logo.webp' },
  { name: 'Alfaparf Milano',   slug: 'alfaparf-milano',   tagline: 'Profesional italiano de alto rendimiento', logo: '/brand logos/alfaparf-logo.webp' },
  { name: 'Lola Cosmetics',    slug: 'lola-cosmetics',    tagline: 'Cuidado capilar brasileño',                logo: '/brand logos/lola-logo.webp' },
  { name: 'Boe Cosmetics',     slug: 'boe-cosmetics',     tagline: 'Tratamientos capilares especializados',    logo: '/brand logos/boe-logo.webp' },
  { name: 'Salerm Cosmetics',  slug: 'salerm-cosmetics',  tagline: 'Cosmética profesional española',           logo: '/brand logos/salerm-logo.webp' },
  { name: 'Mielle Organics',   slug: 'mielle-organics',   tagline: 'Natural y orgánico para rizos',            logo: '/brand logos/mielle-logo.webp' },
  { name: 'Agua de Cielo',     slug: 'agua-de-cielo',     tagline: 'Fragancias dominicanas',                    logo: '/brand logos/agua-logo.webp' },
  { name: 'Difeel',            slug: 'difeel',            tagline: 'Aceites naturales para el cabello',         logo: '/brand logos/difeel-logo.webp' },
  { name: 'OGX',               slug: 'ogx',               tagline: 'Belleza inspirada en la naturaleza',        logo: '/brand logos/ogx-logo.webp' },
  { name: 'Got2b Glued',       slug: 'got2b-glued',       tagline: 'Fijación de alto impacto',                  logo: '/brand logos/got2b-logo.webp' },
  { name: 'Tree Hut',          slug: 'tree-hut',          tagline: 'Body care natural y delicioso',             logo: '/brand logos/treehut-logo.webp' },
  { name: 'Skala Expert',      slug: 'skala-expert',      tagline: 'Cuidado capilar accesible',                logo: '/brand logos/skala-logo.webp' },
  { name: 'Endoten Control',   slug: 'endoten-control',   tagline: 'Control capilar profesional',               logo: '/brand logos/logo-endoten-black.webp' },
  { name: 'The Ordinary',      slug: 'the-ordinary',      tagline: 'Skincare clínico sin complicaciones',       logo: '/brand logos/the-ordinary-logo.webp' },
  { name: 'Dove',              slug: 'dove',              tagline: 'Belleza real, cuidado real',                 logo: '/brand logos/dove-logo.webp' },
  { name: 'Karseell',          slug: 'karseell',          tagline: 'Reparación con colágeno',                   logo: '/brand logos/karseel-logo.webp' },
  { name: 'Olaplex',           slug: 'olaplex',           tagline: 'Ciencia que repara enlaces',                logo: '/brand logos/Olaplex-Logo.webp' },
  { name: 'Bath & Body Works', slug: 'bath-body-works',   tagline: 'Body care premium americano',               logo: '/brand logos/bbw-logo.webp' },
];

/**
 * Nav dropdown subcategories — Denise can edit these in Admin > Navegación.
 * Max 5 items per category. These populate the brown CategoryNav hover dropdowns.
 */
export interface NavDropdownItem {
  label: string;
  href: string;
}

export const SEED_NAV_DROPDOWNS: Record<string, NavDropdownItem[]> = {
  'cabello': [
    { label: 'Shampoo & Acondicionador', href: '/catalogo?categoria=cabello&etiqueta=shampoo' },
    { label: 'Mascarillas & Tratamientos', href: '/catalogo?categoria=cabello&etiqueta=mascarillas' },
    { label: 'Aceites & Sérums', href: '/catalogo?categoria=cabello&etiqueta=aceites' },
    { label: 'Leave-In & Styling', href: '/catalogo?categoria=cabello&etiqueta=styling' },
    { label: 'Color & Tintes', href: '/catalogo?categoria=cabello&etiqueta=color' },
  ],
  'skincare': [
    { label: 'Limpieza', href: '/catalogo?categoria=skincare&etiqueta=limpieza' },
    { label: 'Sérums & Tratamientos', href: '/catalogo?categoria=skincare&etiqueta=serums' },
    { label: 'Hidratantes', href: '/catalogo?categoria=skincare&etiqueta=hidratantes' },
    { label: 'Exfoliantes & Scrubs', href: '/catalogo?categoria=skincare&etiqueta=exfoliantes' },
    { label: 'Body Care', href: '/catalogo?categoria=skincare&etiqueta=bodycare' },
  ],
  'accesorios': [
    { label: 'Herramientas de Cabello', href: '/catalogo?categoria=accesorios&etiqueta=herramientas' },
    { label: 'Brochas & Aplicadores', href: '/catalogo?categoria=accesorios&etiqueta=brochas' },
    { label: 'Organizadores', href: '/catalogo?categoria=accesorios&etiqueta=organizadores' },
  ],
  'marcas': [
    { label: 'Davines', href: '/marcas/davines' },
    { label: 'Alfaparf Milano', href: '/marcas/alfaparf-milano' },
    { label: 'Olaplex', href: '/marcas/olaplex' },
    { label: 'The Ordinary', href: '/marcas/the-ordinary' },
    { label: 'Lola Cosmetics', href: '/marcas/lola-cosmetics' },
  ],
  'ofertas': [
    { label: 'Hasta 30% Off', href: '/catalogo?oferta=true&descuento=30' },
    { label: 'Hasta 50% Off', href: '/catalogo?oferta=true&descuento=50' },
    { label: 'Combos & Sets', href: '/catalogo?oferta=true&etiqueta=combos' },
  ],
};
