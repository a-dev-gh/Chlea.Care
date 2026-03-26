import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  badge?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  openCart:   () => set({ isOpen: true }),
  closeCart:  () => set({ isOpen: false }),
  toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

  addItem: (item) => {
    set(state => {
      const existing = state.items.find(i => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },

  removeItem: (id) =>
    set(state => ({ items: state.items.filter(i => i.id !== id) })),

  updateQty: (id, qty) => {
    if (qty <= 0) { get().removeItem(id); return; }
    set(state => ({
      items: state.items.map(i => i.id === id ? { ...i, quantity: qty } : i),
    }));
  },

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
  count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
}));
