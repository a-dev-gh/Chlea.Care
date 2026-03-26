import { formatPrice } from './formatPrice';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '18097756773';

export function buildCartMessage(items: CartItem[]): string {
  const lines = items
    .map(i => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
    .join('\n');
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  return `🛍️ *Nuevo Pedido — Chlea Care*\n\n${lines}\n\n*Total: ${formatPrice(total)}*\n\nHola! Quisiera hacer este pedido.`;
}

export function buildProductInquiry(productName: string): string {
  return `Hola! Me interesa el producto: *${productName}*. ¿Podrías darme más información?`;
}

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string): void {
  window.open(getWhatsAppUrl(message), '_blank');
}
