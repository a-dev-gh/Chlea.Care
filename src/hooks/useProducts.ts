import { useState, useEffect } from 'react';
import { SEED_PRODUCTS, type SeedProduct } from '../data/seedData';

export interface Product extends SeedProduct {}

interface Filters {
  category?: string;
  brand?: string;
  search?: string;
  onSale?: boolean;
  isHot?: boolean;
  maxPrice?: number;
}

export function useProducts(filters: Filters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using seed data — swap for Supabase query when DB is ready
    let result = SEED_PRODUCTS.filter(p => p.is_visible);

    if (filters.category && filters.category !== 'todos') {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.brand) {
      result = result.filter(p => p.brand === filters.brand);
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

    setProducts(result);
    setLoading(false);
  }, [filters.category, filters.brand, filters.search, filters.onSale, filters.isHot, filters.maxPrice]);

  return { products, loading };
}
