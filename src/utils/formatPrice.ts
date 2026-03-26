export function formatPrice(amount: number): string {
  return `RD$ ${amount.toLocaleString('es-DO')}`;
}
