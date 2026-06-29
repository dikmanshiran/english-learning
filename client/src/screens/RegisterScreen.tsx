import { useState } from 'react';
import { register } from '../services/authService';

interface RegisterScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function RegisterScreen({ onSuccess, onBack }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen active">
      <div className="form-card">
        <h2>📝 Create Account</h2>
        <p>Create a parent account to sync progress across devices</p>
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
          placeholder="Password (min. 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
        />
        <div className="form-btns">
          <button className="form-btn ghost" onClick={onBack}>
            ← Back
          </button>
          <button className="form-btn primary" onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
