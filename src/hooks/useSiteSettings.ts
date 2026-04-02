import { useState, useEffect } from 'react';
import { fetchSettings } from '../utils/db';
import type { SiteSettings } from '../types/database';

// Static defaults — used while Supabase loads and as fallback
const DEFAULTS: SiteSettings = {
  banner_text:    'Envíos disponibles · WhatsApp: +1 (809) 775-6773',
  whatsapp_number:'18094517690',
  hero_tagline:   'Glow Different, Glow Chlea',
  hero_sub:       'Productos premium de cabello, piel y estilo curados para las que exigen más.',
  about_text:     'Chlea Care nació de un sueño simple: que cada mujer tenga acceso a productos de belleza que realmente funcionen, sin comprometer su bienestar ni su estilo. Aquí cuido cada detalle para que tú brilles.',
  search_featured_labels: 'Tipo de Cabello,Preocupaciones',
  search_price_filter: 'true',
  politicas_envio: `**Envíos en Santo Domingo**\nTodos los pedidos dentro de Santo Domingo se envían mediante Uber o un motorista de confianza, directo a tu puerta. El costo de envío varía según la distancia y se te indicará al confirmar tu pedido por WhatsApp.\n\n**Envíos a Nivel Nacional**\nPara envíos al interior del país, trabajamos con Vimenpaq, Transporte Espinal, Caribe Tours y otros métodos de transporte disponibles a nivel nacional. El costo dependerá del peso de tu paquete y el destino. Los pedidos enviados por estos servicios deben ser pagados en su totalidad mediante transferencia bancaria antes del despacho.\n\n**Pago Contra Entrega**\nSi eliges pago contra entrega (disponible solo en Santo Domingo), el pago debe realizarse en efectivo al momento de recibir tu pedido.\n\n**Tiempo de Entrega**\nEl tiempo de entrega varía según el destino, pero normalmente se realiza dentro de las 24 horas a 3 días laborables. Te notificaremos por WhatsApp una vez confirmados tus productos, ubicación y método de pago.\n\n**Confirmación de Entrega**\nUna vez entregado tu pedido, nuestro equipo confirmará la recepción contigo por WhatsApp. Si por cualquier razón no recibes tu pedido, te lo enviaremos nuevamente o podrás completar un formulario de reclamación.`,
  politicas_reembolso: `**Política de Cambios y Devoluciones**\nEn Chlea Care queremos que estés 100% satisfecha con tu compra. No realizamos reembolsos en efectivo, pero sí ofrecemos cambios de productos.\n\n**Condiciones para Cambios**\nAceptamos cambios de productos y/o artículos personales que se encuentren en malas condiciones o vencidos. El producto debe estar en su empaque original.\n\n**Costos de Devolución**\nLos gastos de envío para devoluciones y cambios corren por cuenta del cliente.\n\n**Cómo Solicitar un Cambio**\nPara solicitar un cambio, escríbenos por WhatsApp al +1 (809) 775-6773 con tu número de pedido, fotos del producto y el motivo del cambio. Nuestro equipo te guiará en el proceso con todo el cariño. ✨`,
};

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;

    fetchSettings().then((data) => {
      if (!cancelled) setSettings(data);
    });

    return () => { cancelled = true; };
  }, []);

  return settings;
}
