import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { adminUpsertSettings } from '../../utils/adminApi';
import { fetchSettings } from '../../utils/db';

const FIELDS = [
  { key: 'banner_text',    label: 'Texto del banner' },
  { key: 'whatsapp_number', label: 'Numero de WhatsApp' },
  { key: 'whatsapp_greeting', label: 'Saludo de WhatsApp (checkout)' },
  { key: 'hero_tagline',   label: 'Tagline del hero' },
  { key: 'hero_sub',       label: 'Subtexto del hero' },
  { key: 'about_text',     label: 'Texto "Sobre Nosotros"' },
];

// "Sobre Nosotras" page fields
const ABOUT_FIELDS = [
  { key: 'about_title',    label: 'Titulo de la pagina' },
  { key: 'about_subtitle', label: 'Subtitulo (encabezado pequeño)' },
  { key: 'about_extra',    label: 'Texto adicional (seccion extra)' },
];

// Policy page textarea fields
const POLICY_FIELDS = [
  { key: 'politicas_envio',     label: 'Politicas de Envio' },
  { key: 'politicas_reembolso', label: 'Politicas de Reembolso' },
];

export function AdminConfiguracion() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load settings from Supabase (or defaults) on mount
  useEffect(() => {
    (async () => {
      const settings = await fetchSettings();
      // Convert SiteSettings object to Record<string, string>
      const record: Record<string, string> = {};
      for (const [k, v] of Object.entries(settings)) {
        if (v != null) record[k] = String(v);
      }
      setValues(record);
      setLoading(false);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const ok = await adminUpsertSettings(values);
    setSaving(false);

    if (ok) {
      setFeedback({ type: 'success', text: 'Configuracion guardada' });
    } else {
      setFeedback({ type: 'error', text: 'Error al guardar. Supabase no configurado o hubo un problema.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  }

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando configuracion...</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 28 }}>
        Configuracion
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {FIELDS.map(field => (
          <div key={field.key}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              {field.label}
            </label>
            {field.key === 'about_text' || field.key === 'hero_sub' || field.key === 'whatsapp_greeting' ? (
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

        {/* Sobre Nosotras page section */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400,
            color: 'var(--hot)', marginBottom: 20, paddingTop: 16,
            borderTop: '1.5px solid var(--border2)',
          }}>
            Pagina "Sobre Nosotras"
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
            El texto principal ya se edita arriba ("Texto Sobre Nosotros"). Aqui puedes editar el titulo, subtitulo, y contenido extra.
          </p>

          {ABOUT_FIELDS.map(field => (
            <div key={field.key} style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                {field.label}
              </label>
              {field.key === 'about_extra' ? (
                <textarea
                  value={values[field.key] || ''}
                  onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                  rows={5}
                  placeholder="Usa **texto** para negritas y doble salto de linea para parrafos"
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
        </div>

        {/* Policy pages section */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400,
            color: 'var(--hot)', marginBottom: 20, paddingTop: 16,
            borderTop: '1.5px solid var(--border2)',
          }}>
            Paginas de Politicas
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
            Usa **texto** para negritas y doble salto de linea para separar parrafos.
          </p>

          {POLICY_FIELDS.map(field => (
            <div key={field.key} style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                {field.label}
              </label>
              <textarea
                value={values[field.key] || ''}
                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                rows={8}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                  fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)',
                  resize: 'vertical', outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          {feedback && (
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: feedback.type === 'success' ? '#25D366' : '#ef4444',
            }}>
              {feedback.type === 'success' ? '> ' : '! '}{feedback.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
