import { useState } from 'react';
import { login } from '../services/authService';
import { useAuthStore } from '../store/authStore';

interface ParentZoneModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function ParentZoneModal({ onSuccess, onClose }: ParentZoneModalProps) {
  const { email } = useAuthStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onSuccess();
    } catch {
      setError('סיסמה שגויה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface-1)', borderRadius: '20px',
          padding: '28px 24px', width: '100%', maxWidth: '340px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>👨‍👩‍👧</div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>אזור הורים</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: '6px 0 0' }}>
            אמת את הסיסמה כדי להמשיך
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
            {email}
          </div>
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '1rem',
              outline: 'none', textAlign: 'right',
            }}
          />
          {error && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="start-btn"
            style={{ marginTop: '4px', opacity: loading || !password ? 0.6 : 1 }}
          >
            {loading ? 'מאמת...' : 'כניסה לאזור הורים →'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-dim)',
              fontSize: '0.85rem', cursor: 'pointer', padding: '4px',
            }}
          >
            ביטול
          </button>
        </form>
      </div>
    </div>
  );
}
