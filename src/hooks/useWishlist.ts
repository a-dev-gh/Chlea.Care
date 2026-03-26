import { useState, useEffect } from 'react';

const KEY = 'chlea_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  function toggle(id: string) {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function isLiked(id: string) { return wishlist.includes(id); }

  return { wishlist, toggle, isLiked };
}
