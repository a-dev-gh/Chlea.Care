import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import type { SeedProduct } from '../../data/seedData';

interface ProductGridProps {
  products: SeedProduct[];
  isMen?: boolean;
  columns?: number;
}

export function ProductGrid({ products, isMen = false, columns = 3 }: ProductGridProps) {
  const [selected, setSelected] = useState<SeedProduct | null>(null);

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 20,
      }}
        className={`product-grid product-grid--${columns}`}
      >
        {products.map(p => (
          <ProductCard key={p.id} product={p} isMen={isMen} onOpenModal={setSelected} />
        ))}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />

      <style>{`
        @media (max-width: 1100px) {
          .product-grid--3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
        @media (max-width: 380px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
