import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      // Signup itself stays fast — the styling profile (skin tone, height,
      // measurements) is captured right after, on its own dedicated step.
      navigate('/complete-profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 80, paddingBottom: 80 }}>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, marginBottom: 8 }}>Create an Account</h1>
      <p style={{ color: 'var(--bone-dim)', fontSize: 14, marginBottom: 32 }}>
        Takes ten seconds. We'll build your styling profile right after.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && <div className="error-msg">{error}</div>}
        <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--bone-dim)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--thread)' }}>Sign in</Link>
      </p>
    </div>
  );
}
