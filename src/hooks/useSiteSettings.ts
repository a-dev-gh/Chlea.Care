// Returns static defaults — swap internals for Supabase query once DB is connected
const DEFAULTS: Record<string, string> = {
  banner_text:    'Envíos disponibles · WhatsApp: +1 (809) 775-6773',
  whatsapp_number:'18097756773',
  hero_tagline:   'Glow Different, Glow Chlea',
  hero_sub:       'Productos premium de cabello, piel y estilo curados para las que exigen más.',
  about_text:     'Chlea Care nació de un sueño simple: que cada mujer tenga acceso a productos de belleza que realmente funcionen, sin comprometer su bienestar ni su estilo. Aquí cuido cada detalle para que tú brilles.',
};

export function useSiteSettings(): Record<string, string> {
  return DEFAULTS;
}
