import type { Brand, Product } from '../types/database';

/**
 * Get brands that have at least 1 visible product in the given category.
 * If category is empty/undefined, returns all brands that have any visible product.
 */
export function getBrandsForCategory(
  category: string,
  products: Product[],
  brands: Brand[]
): Brand[] {
  const brandNamesInCat = new Set<string>();

  for (const p of products) {
    // fetchProducts already filters is_visible, but guard here too
    if (!p.brand) continue;
    if (category && p.category !== category) continue;
    brandNamesInCat.add(p.brand);
  }

  return brands.filter(b => brandNamesInCat.has(b.name));
}

/**
 * Get all category slugs that have at least 1 visible product for a given brand.
 */
export function getCategoriesForBrand(
  brandName: string,
  products: Product[]
): string[] {
  const cats = new Set<string>();
  for (const p of products) {
    if (p.brand !== brandName) continue;
    cats.add(p.category);
  }
  return Array.from(cats);
}

/**
 * Get all brands that have at least 1 visible product AND a logo.
 */
export function getBrandsWithProducts(
  products: Product[],
  brands: Brand[]
): Brand[] {
  const brandNamesWithProducts = new Set<string>();
  for (const p of products) {
    if (!p.brand) continue;
    brandNamesWithProducts.add(p.brand);
  }
  return brands.filter(b => brandNamesWithProducts.has(b.name) && b.logo_url);
}

/**
 * Get category slugs that have at least 1 brand with products (for showing/hiding tabs).
 */
export function getCategoriesWithBrands(
  products: Product[]
): string[] {
  const catBrands = new Map<string, Set<string>>();
  for (const p of products) {
    if (!p.brand) continue;
    if (!catBrands.has(p.category)) catBrands.set(p.category, new Set());
    catBrands.get(p.category)!.add(p.brand);
  }
  return Array.from(catBrands.keys()).filter(cat => catBrands.get(cat)!.size > 0);
}
