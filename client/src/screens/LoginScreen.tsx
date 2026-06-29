import { useState } from 'react';
import { login } from '../services/authService';

interface LoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
  onRegister: () => void;
}

export function LoginScreen({ onSuccess, onBack, onRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen active">
      <div className="form-card">
        <h2>🔐 Parent Login</h2>
        <p>Sign in to sync your children's progress across devices</p>
        {error && <div style={{ color: '#fca5a5', marginBottom: '12px', fontSize: '.9rem' }}>{error}</div>}
        <input
          className="name-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="name-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <div className="form-btns">
          <button className="form-btn ghost" onClick={onBack}>
            ← Back
          </button>
          <button className="form-btn primary" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-dim)', fontSize: '.85rem' }}>
          No account?{' '}
          <span style={{ color: 'var(--primary-light)', cursor: 'pointer' }} onClick={onRegister}>
            Register here
          </span>
        </div>
      </div>
    </div>
  );
}
