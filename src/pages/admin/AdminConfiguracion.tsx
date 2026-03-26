import { useState } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Button } from '../../components/ui/Button';

const FIELDS = [
  { key: 'banner_text',    label: 'Texto del banner' },
  { key: 'whatsapp_number', label: 'Número de WhatsApp' },
  { key: 'hero_tagline',   label: 'Tagline del hero' },
  { key: 'hero_sub',       label: 'Subtexto del hero' },
  { key: 'about_text',     label: 'Texto "Sobre Nosotros"' },
];

export function AdminConfiguracion() {
  const defaults = useSiteSettings();
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: save to Supabase site_settings
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 28 }}>
        Configuración
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {FIELDS.map(field => (
          <div key={field.key}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              {field.label}
            </label>
            {field.key === 'about_text' || field.key === 'hero_sub' ? (
              <textarea
                value={values[field.key] || ''}
                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                  fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)',
                  resize: 'vertical', outline: 'none',
                }}
              />
            ) : (
              <input
                type="text"
                value={values[field.key] || ''}
                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                  fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)', outline: 'none',
                }}
              />
            )}
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button type="submit">Guardar cambios</Button>
          {saved && <span style={{ fontSize: 14, color: '#25D366', fontWeight: 600 }}>✓ Guardado</span>}
        </div>
      </form>
    </div>
  );
}
