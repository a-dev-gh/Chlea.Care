import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ImageUploader } from '../components/ui/ImageUploader';
import { showToast } from '../components/ui/Toast';
import { fetchUserProfile, updateUserProfile } from '../utils/db';
import { supabase } from '../utils/supabase';
import type { UserProfile, UserAddress } from '../types/database';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DR_PROVINCES = [
  'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'San Cristóbal',
  'La Romana', 'San Pedro de Macorís', 'Puerto Plata', 'Duarte', 'La Altagracia',
  'Espaillat', 'Peravia', 'Monseñor Nouel', 'Sánchez Ramírez', 'Monte Plata',
  'Valverde', 'María Trinidad Sánchez', 'Hermanas Mirabal', 'Barahona', 'Azua',
  'San Juan', 'Monte Cristi', 'Samaná', 'Hato Mayor', 'El Seibo',
  'Dajabón', 'Santiago Rodríguez', 'Elías Piña', 'San José de Ocoa',
  'Independencia', 'Pedernales', 'Baoruco',
];

type Tab = 'perfil' | 'direcciones' | 'seguridad' | 'pedidos';

// ---------------------------------------------------------------------------
// Shared input style (used in both auth forms and profile sections)
// ---------------------------------------------------------------------------
const inputStyle: React.CSSProperties = {
  padding: '13px 16px',
  borderRadius: 'var(--r-sm)',
  border: '1.5px solid var(--border2)',
  fontSize: 15,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  color: 'var(--text)',
  background: 'var(--white)',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 6,
  display: 'block',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
};

// ---------------------------------------------------------------------------
// Empty address template
// ---------------------------------------------------------------------------
function emptyAddress(): Omit<UserAddress, 'id'> {
  return {
    label: 'Casa',
    name: '',
    phone: '',
    address: '',
    city: '',
    province: 'Distrito Nacional',
    is_default: false,
  };
}

// ---------------------------------------------------------------------------
// AddressModal — add / edit a single address
// ---------------------------------------------------------------------------
interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  initial: Omit<UserAddress, 'id'> & { id?: string };
  onSave: (addr: UserAddress) => void;
}

function AddressModal({ open, onClose, initial, onSave }: AddressModalProps) {
  const [form, setForm] = useState({ ...initial });

  // Sync when the modal opens with new data (e.g. edit vs add)
  useEffect(() => {
    if (open) setForm({ ...initial });
  }, [open, initial]);

  function handleChange(field: keyof typeof form, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.city.trim()) {
      showToast('Completa todos los campos obligatorios.', 'error');
      return;
    }
    onSave({
      id: initial.id ?? crypto.randomUUID(),
      label: form.label,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      province: form.province,
      is_default: form.is_default,
    });
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth={500}>
      <div style={{ padding: '28px 28px 24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22, marginBottom: 20, color: 'var(--deep)' }}>
          {initial.id ? 'Editar dirección' : 'Agregar dirección'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Label select */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Tipo</label>
            <select
              value={form.label}
              onChange={e => handleChange('label', e.target.value)}
              style={inputStyle}
            >
              <option value="Casa">Casa</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Recipient name */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Nombre del destinatario *</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* Phone */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Teléfono</label>
            <input
              type="tel"
              placeholder="809-000-0000"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Street address */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Dirección *</label>
            <input
              type="text"
              placeholder="Calle, número, sector"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* City and Province side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Ciudad *</label>
              <input
                type="text"
                placeholder="Santo Domingo"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Provincia</label>
              <select
                value={form.province}
                onChange={e => handleChange('province', e.target.value)}
                style={inputStyle}
              >
                {DR_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Default address checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={e => handleChange('is_default', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--hot)', cursor: 'pointer' }}
            />
            Usar como dirección predeterminada
          </label>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <Button type="submit" fullWidth>
              Guardar dirección
            </Button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 'var(--r-sm)',
                border: '1.5px solid var(--border2)', background: 'none',
                fontSize: 15, fontFamily: 'var(--font-body)', cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// AccountPage — main component
// ---------------------------------------------------------------------------
export function AccountPage() {
  const { user, role, signIn, signUp, signOut, loading } = useAuthContext();

  // Auth form state
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Profile page state
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Tab 1 — Perfil
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Tab 2 — Direcciones
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<(Omit<UserAddress, 'id'> & { id?: string }) | null>(null);

  // Tab 3 — Seguridad
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Load profile when user is available
  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    fetchUserProfile(user.id).then(p => {
      if (p) {
        setProfile(p);
        setFullName(p.full_name ?? '');
        setPhone(p.phone ?? '');
        setAvatarUrl(p.avatar_url ?? '');
        setAddresses(p.addresses ?? []);
      }
      setProfileLoading(false);
    });
  }, [user]);

  // ---------------------------------------------------------------------------
  // Auth form handlers
  // ---------------------------------------------------------------------------
  function switchMode(next: 'login' | 'signup') {
    setMode(next);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    const { error: err } = await signIn(email, password);
    if (err) setError(err);
    setSubmitting(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signUp(email, password);
    if (err) {
      setError(err);
    } else {
      setSuccessMsg('Cuenta creada! Revisa tu correo para confirmar.');
    }
    setSubmitting(false);
  }

  // ---------------------------------------------------------------------------
  // Profile save
  // ---------------------------------------------------------------------------
  async function handleSaveProfile() {
    if (!user) return;
    setSavingProfile(true);
    const ok = await updateUserProfile(user.id, {
      full_name: fullName.trim(),
      phone: phone.trim(),
      avatar_url: avatarUrl,
    });
    setSavingProfile(false);
    if (ok) {
      showToast('Perfil actualizado', 'success');
    } else {
      showToast('Error al guardar el perfil', 'error');
    }
  }

  // ---------------------------------------------------------------------------
  // Address handlers
  // ---------------------------------------------------------------------------
  const persistAddresses = useCallback(async (next: UserAddress[]) => {
    if (!user) return;
    const ok = await updateUserProfile(user.id, { addresses: next });
    if (!ok) showToast('Error al guardar direcciones', 'error');
  }, [user]);

  function openAddAddress() {
    setEditingAddr(emptyAddress());
    setAddrModalOpen(true);
  }

  function openEditAddress(addr: UserAddress) {
    setEditingAddr({ ...addr });
    setAddrModalOpen(true);
  }

  async function handleSaveAddress(addr: UserAddress) {
    let next: UserAddress[];
    const exists = addresses.some(a => a.id === addr.id);

    if (addr.is_default) {
      // Clear default from all others when this one is set as default
      const cleared = addresses.map(a => ({ ...a, is_default: false }));
      if (exists) {
        next = cleared.map(a => a.id === addr.id ? addr : a);
      } else {
        next = [...cleared, addr];
      }
    } else {
      if (exists) {
        next = addresses.map(a => a.id === addr.id ? addr : a);
      } else {
        next = [...addresses, addr];
      }
    }

    setAddresses(next);
    setAddrModalOpen(false);
    await persistAddresses(next);
    showToast('Dirección guardada', 'success');
  }

  async function handleDeleteAddress(id: string) {
    const next = addresses.filter(a => a.id !== id);
    setAddresses(next);
    await persistAddresses(next);
    showToast('Dirección eliminada', 'success');
  }

  async function handleSetDefault(id: string) {
    const next = addresses.map(a => ({ ...a, is_default: a.id === id }));
    setAddresses(next);
    await persistAddresses(next);
    showToast('Dirección predeterminada actualizada', 'success');
  }

  // ---------------------------------------------------------------------------
  // Password change
  // ---------------------------------------------------------------------------
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (!supabase) {
      showToast('Supabase no configurado', 'error');
      return;
    }
    setSavingPassword(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (err) {
      showToast('Error: ' + err.message, 'error');
    } else {
      showToast('Contraseña actualizada', 'success');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
        Cargando...
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Logged-in profile view
  // ---------------------------------------------------------------------------
  if (user) {
    // Human-readable role label for badge
    const roleLabel =
      role === 'super_admin' ? 'Super Admin'
      : role === 'owner' ? 'Propietaria'
      : role === 'employee' ? 'Empleada'
      : null;

    // Initial letter fallback for avatar
    const initial = (fullName || user.email || '?')[0].toUpperCase();

    const tabs: { key: Tab; label: string }[] = [
      { key: 'perfil', label: 'Perfil' },
      { key: 'direcciones', label: 'Direcciones' },
      { key: 'seguridad', label: 'Seguridad' },
      { key: 'pedidos', label: 'Pedidos' },
    ];

    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* ── Header: Avatar + Name + Email ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Avatar circle */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || 'Avatar'}
                style={{
                  width: 88, height: 88, borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--pink)',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'var(--pink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, color: 'var(--deep)', fontWeight: 600,
                border: '3px solid var(--pink)',
              }}>
                {initial}
              </div>
            )}
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 26,
            fontWeight: 400, marginBottom: 4, color: 'var(--deep)',
          }}>
            {fullName || 'Mi Cuenta'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: roleLabel ? 10 : 0 }}>
            {user.email}
          </p>

          {/* Role badge — only for admin users */}
          {roleLabel && (
            <span style={{
              display: 'inline-block', padding: '4px 14px',
              borderRadius: 999, fontSize: 12, fontWeight: 600,
              letterSpacing: 0.5, textTransform: 'uppercase',
              background: 'var(--deep)', color: 'var(--pink)',
            }}>
              {roleLabel}
            </span>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '9px 18px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 400,
                background: activeTab === tab.key ? 'var(--hot)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--deep)',
                transition: 'background 0.15s, color 0.15s',
                outline: activeTab === tab.key ? 'none' : '1.5px solid var(--border2)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {profileLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Cargando perfil...
          </div>
        ) : (
          <>
            {/* ============================================================
                Tab 1: Perfil
            ============================================================ */}
            {activeTab === 'perfil' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Avatar section */}
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: 20,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--deep)' }}>
                    Foto de perfil
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {/* Current avatar preview */}
                    <div>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          style={{
                            width: 64, height: 64, borderRadius: '50%',
                            objectFit: 'cover', border: '2px solid var(--pink)',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 64, height: 64, borderRadius: '50%',
                          background: 'var(--pink)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 26, color: 'var(--deep)', fontWeight: 600,
                        }}>
                          {initial}
                        </div>
                      )}
                    </div>
                    {/* Uploader */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <ImageUploader
                        folder="avatars"
                        resizeTo={{ width: 200, height: 200 }}
                        currentUrl={avatarUrl}
                        onUpload={url => setAvatarUrl(url)}
                        size="gallery"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal info fields */}
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, color: 'var(--deep)' }}>
                    Información personal
                  </h3>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Nombre completo</label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      type="tel"
                      placeholder="809-000-0000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  {/* Email — read only, Supabase manages it */}
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Correo electrónico</label>
                    <input
                      type="email"
                      value={user.email ?? ''}
                      readOnly
                      style={{ ...inputStyle, background: 'var(--cream)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      El correo no puede modificarse aquí.
                    </span>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================
                Tab 2: Direcciones
            ============================================================ */}
            {activeTab === 'direcciones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Add button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={openAddAddress}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 18px',
                      borderRadius: 'var(--r-sm)',
                      border: '1.5px solid var(--hot)',
                      background: 'none',
                      color: 'var(--hot)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                    Agregar dirección
                  </button>
                </div>

                {/* Empty state */}
                {addresses.length === 0 && (
                  <div style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: '32px 20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                  }}>
                    No tienes direcciones guardadas aún.
                  </div>
                )}

                {/* Address cards */}
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    style={{
                      background: 'var(--white)',
                      border: `1px solid ${addr.is_default ? 'var(--hot)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-md)',
                      padding: 20,
                      position: 'relative',
                    }}
                  >
                    {/* Label row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: 0.5, color: 'var(--deep)',
                      }}>
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          background: '#d1fae5', color: '#065f46',
                          borderRadius: 999, padding: '2px 10px',
                        }}>
                          Predeterminada
                        </span>
                      )}
                    </div>

                    {/* Address details */}
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                      <strong>{addr.name}</strong>
                      {addr.phone && <> · {addr.phone}</>}
                      <br />
                      {addr.address}
                      <br />
                      {addr.city}, {addr.province}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => openEditAddress(addr)}
                        style={{
                          fontSize: 13, color: 'var(--deep)', background: 'none',
                          border: '1px solid var(--border2)', borderRadius: 6,
                          padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{
                          fontSize: 13, color: 'var(--hot)', background: 'none',
                          border: '1px solid rgba(235,25,130,0.25)', borderRadius: 6,
                          padding: '5px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                        }}
                      >
                        Eliminar
                      </button>
                      {!addr.is_default && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr.id)}
                          style={{
                            fontSize: 13, color: 'var(--text-muted)', background: 'none',
                            border: 'none', padding: '5px 0', cursor: 'pointer',
                            fontFamily: 'var(--font-body)', textDecoration: 'underline',
                          }}
                        >
                          Usar como predeterminada
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ============================================================
                Tab 3: Seguridad
            ============================================================ */}
            {activeTab === 'seguridad' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Change password */}
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: 20,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--deep)' }}>
                    Cambiar contraseña
                  </h3>
                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Nueva contraseña</label>
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={inputStyle}
                        minLength={6}
                        required
                      />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Confirmar nueva contraseña</label>
                      <input
                        type="password"
                        placeholder="Repite la contraseña"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        style={inputStyle}
                        minLength={6}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={savingPassword}>
                      {savingPassword ? 'Guardando...' : 'Cambiar contraseña'}
                    </Button>
                  </form>
                </div>

                {/* Account info — read only */}
                <div style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: 20,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--deep)' }}>
                    Información de la cuenta
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Email row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        Correo
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--text)' }}>{user.email}</span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--border)' }} />

                    {/* Created date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        Cuenta creada
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--text)' }}>
                        {new Date(user.created_at).toLocaleDateString('es-DO', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Role badge — only for admin users */}
                    {roleLabel && (
                      <>
                        <div style={{ height: 1, background: 'var(--border)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                            Rol
                          </span>
                          <span style={{
                            fontSize: 12, fontWeight: 600, padding: '3px 12px',
                            borderRadius: 999, background: 'var(--deep)', color: 'var(--pink)',
                          }}>
                            {roleLabel}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================
                Tab 4: Pedidos
            ============================================================ */}
            {activeTab === 'pedidos' && (
              <div style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: '36px 24px',
                textAlign: 'center',
              }}>
                {/* Shopping bag icon */}
                <svg
                  width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke="var(--pink)" strokeWidth="1.5"
                  style={{ marginBottom: 16, display: 'block', margin: '0 auto 16px' }}
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>

                <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 8, lineHeight: 1.6 }}>
                  Tu historial de pedidos aparecerá aquí.
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                  Los pedidos se realizan por WhatsApp.
                </p>

                {/* WhatsApp contact link */}
                <a
                  href="https://wa.me/18094517690"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px',
                    borderRadius: 'var(--r-sm)',
                    background: '#25D366',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600, fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  {/* WhatsApp icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  ¿Dudas sobre un pedido? Contáctanos
                </a>
              </div>
            )}
          </>
        )}

        {/* ── Sign out button ── */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Button onClick={signOut} variant="outline">
            Cerrar sesión
          </Button>
        </div>

        {/* ── Address modal ── */}
        {editingAddr !== null && (
          <AddressModal
            open={addrModalOpen}
            onClose={() => setAddrModalOpen(false)}
            initial={editingAddr}
            onSave={handleSaveAddress}
          />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Auth forms (login / signup) — unchanged from original
  // ---------------------------------------------------------------------------
  const isLogin = mode === 'login';

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 32,
        fontWeight: 300, color: 'var(--text)', marginBottom: 8,
      }}>
        Mi Cuenta
      </h1>

      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>
        {isLogin
          ? 'Inicia sesion para ver tu historial de pedidos.'
          : 'Crea tu cuenta para guardar tus listas y mas.'}
      </p>

      {/* Mode toggle tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => switchMode('login')}
          style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: isLogin ? 700 : 400,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: isLogin ? '2px solid var(--hot)' : '2px solid var(--border2)',
            color: isLogin ? 'var(--hot)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          Iniciar Sesion
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: !isLogin ? 700 : 400,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: !isLogin ? '2px solid var(--hot)' : '2px solid var(--border2)',
            color: !isLogin ? 'var(--hot)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          Crear Cuenta
        </button>
      </div>

      {/* Login form */}
      {isLogin && (
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email" placeholder="Correo electronico" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Contrasena" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: 'var(--hot)', fontSize: 13 }}>{error}</p>}
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Iniciar sesion'}
          </Button>
        </form>
      )}

      {/* Signup form */}
      {!isLogin && (
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email" placeholder="Correo electronico" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Contrasena" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder="Confirmar contrasena" required
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: 'var(--hot)', fontSize: 13 }}>{error}</p>}
          {successMsg && (
            <p style={{
              color: 'var(--deep)', fontSize: 14,
              background: 'var(--pink)', borderRadius: 'var(--r-sm)',
              padding: '12px 16px', lineHeight: 1.4,
            }}>
              {successMsg}
            </p>
          )}
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
      )}
    </div>
  );
}
