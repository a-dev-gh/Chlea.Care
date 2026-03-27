export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image_url: string;
  category: string;
  published_at: string;
  is_visible: boolean;
}

export const BLOG_CATEGORIES = ['Tips', 'Reseñas', 'Rutinas', 'Novedades'];

export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Tips para mantener tu cabello hidratado en el calor',
    slug: '5-tips-cabello-hidratado',
    excerpt: 'El clima tropical puede ser duro con tu cabello. Aquí te comparto mis secretos para mantenerlo suave y brillante todo el año.',
    body: `El cabello necesita cuidado especial en climas cálidos y húmedos como el de Santo Domingo. Aquí mis 5 tips favoritos:

1. **Usa un leave-in con protección térmica** — Antes de salir, aplica un leave-in que también proteja del sol.

2. **Mascarilla semanal** — Dedica al menos 20 minutos una vez a la semana a una mascarilla hidratante profunda.

3. **Evita el agua caliente** — Lava tu cabello con agua tibia o fría para sellar la cutícula.

4. **Aceite de argán en las puntas** — Un poquito en las puntas antes de dormir hace maravillas.

5. **No te saltes el acondicionador** — Siempre, siempre, siempre usa acondicionador después del shampoo.

¿Tienes preguntas? ¡Escríbeme por WhatsApp!`,
    image_url: '',
    category: 'Tips',
    published_at: '2025-03-20',
    is_visible: true,
  },
  {
    id: '2',
    title: 'Mi rutina de skincare nocturna favorita',
    slug: 'rutina-skincare-nocturna',
    excerpt: 'Una rutina simple pero efectiva que transformó mi piel. Te cuento paso a paso qué uso y por qué.',
    body: `Mi rutina nocturna es simple pero consistente. Aquí va:

1. **Limpieza doble** — Primero un aceite limpiador para remover maquillaje, luego un gel suave.

2. **Tónico** — Hidratante, sin alcohol. Prepara la piel para absorber mejor los tratamientos.

3. **Sérum de Niacinamida** — The Ordinary Niacinamide 10% + Zinc 1%. Controla los poros y las manchas.

4. **Hidratante** — Una crema rica pero no pesada.

5. **Aceite de rosa mosqueta** — Solo unas gotitas para sellar toda la hidratación.

La clave es la consistencia. No necesitas 20 productos, necesitas los correctos. 💕`,
    image_url: '',
    category: 'Rutinas',
    published_at: '2025-03-15',
    is_visible: true,
  },
  {
    id: '3',
    title: 'Olaplex No. 3: ¿Vale la pena?',
    slug: 'olaplex-no3-resena',
    excerpt: 'Probé el famoso tratamiento de Olaplex durante 3 meses. Aquí mi opinión honesta.',
    body: `Después de 3 meses usando Olaplex No. 3 una vez por semana, puedo decir que SÍ vale la pena.

**Lo bueno:**
- Mi cabello tiene menos rotura
- Se siente más fuerte y elástico
- El brillo mejoró notablemente

**Lo no tan bueno:**
- Es una inversión (RD$ 2,200)
- Necesitas paciencia — los resultados toman semanas

**Mi veredicto:** Si tu cabello está procesado, decolorado o dañado, es una inversión que vale cada peso. Si tu cabello está sano, hay opciones más económicas.

¡Lo tenemos disponible en la tienda! Pregúntame por WhatsApp si tienes dudas.`,
    image_url: '',
    category: 'Reseñas',
    published_at: '2025-03-10',
    is_visible: true,
  },
];
