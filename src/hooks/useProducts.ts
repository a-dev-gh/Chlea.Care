import { useState, useEffect } from 'react';
import { fetchProducts } from '../utils/db';
import type { Product } from '../types/database';

// Re-export the DB type so consumers don't need to import from two places
export type { Product };

interface Filters {
  category?: string;
  brand?: string;
  search?: string;
  onSale?: boolean;
  isHot?: boolean;
  maxPrice?: number;
  minPrice?: number;
}

export function useProducts(filters: Filters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products once (from Supabase or seed fallback)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchProducts().then((data) => {
      if (!cancelled) {
        setAllProducts(data);
      }
    });

    return () => { cancelled = true; };
  }, []);

  // Apply client-side filters whenever allProducts or filters change
  useEffect(() => {
    let result = [...allProducts];

    if (filters.category && filters.category !== 'todos') {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.brand) {
      const brandSlug = filters.brand.toLowerCase().replace(/[&\s]+/g, '-').replace(/--+/g, '-');
      result = result.filter(p => p.brand_slug === brandSlug);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (filters.onSale) {
      result = result.filter(p => p.sale_percent > 0);
    }
    if (filters.isHot) {
      result = result.filter(p => p.is_hot);
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.minPrice) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }

    setProducts(result);
    setLoading(false);
  }, [allProducts, filters.category, filters.brand, filters.search, filters.onSale, filters.isHot, filters.maxPrice, filters.minPrice]);

  return { products, allProducts, loading };
}
