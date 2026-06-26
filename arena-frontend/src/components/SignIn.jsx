import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../authContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.5-2.9-11.2-7.1l-6.5 5C9.8 39.8 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  );
}

export default function SignIn({ onSuccess, onSwitchMode }) {
  const { handleAuthSuccess } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess(result.user);
      onSuccess?.();
    } catch (err) {
      // Firebase error codes → friendly messages
      const msg = {
        'auth/user-not-found':  'No account found with this email.',
        'auth/wrong-password':  'Incorrect password. Please try again.',
        'auth/invalid-email':   'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      }[err.code] ?? err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result.user);
      onSuccess?.();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message ?? 'Google sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          width: '100%', maxWidth: 400, background: '#111118',
          border: '1px solid #1e1e2e', borderRadius: 20, padding: '40px 36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#10b981', letterSpacing: '-0.02em' }}>◈ Arena</span>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8' }}>Sign in to compete</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#1a0808', border: '1px solid #4e1414', color: '#ef4444',
              fontSize: 12, padding: '10px 14px', borderRadius: 8, marginBottom: 20 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Email"    type="email"    value={email}    onChange={e => setEmail(e.target.value)}    placeholder="you@example.com" required />
          <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"        required />

          <motion.button type="submit" disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
            style={{
              marginTop: 6, width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
              background: loading ? '#064e2a' : '#10b981', color: loading ? '#10b981' : '#000',
              fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 24px rgba(16,185,129,0.3)',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
            }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <Divider />
        <GoogleButton onClick={handleGoogleAuth} loading={loading} label="Continue with Google" />

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#475569' }}>
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchMode}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: '#10b981', fontWeight: 600, fontSize: 13, padding: 0 }}>
            Sign up
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: '#0a0a0f', border: `1px solid ${focused ? '#10b981' : '#1e1e2e'}`,
          borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f1f5f9',
          outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border 0.2s',
        }} />
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#1e1e2e' }} />
      <span style={{ fontSize: 11, color: '#2a2a3e', fontWeight: 600, letterSpacing: '0.06em' }}>OR</span>
      <div style={{ flex: 1, height: 1, background: '#1e1e2e' }} />
    </div>
  );
}

function GoogleButton({ onClick, loading, label }) {
  return (
    <motion.button type="button" onClick={onClick} disabled={loading}
      whileHover={!loading ? { scale: 1.02, background: '#16161f' } : {}}
      whileTap={!loading   ? { scale: 0.98 } : {}}
      style={{
        width: '100%', padding: '11px 0', borderRadius: 10,
        background: '#111118', border: '1px solid #2a2a3e',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
        color: '#f1f5f9', transition: 'background 0.2s',
      }}>
      <GoogleIcon />{label}
    </motion.button>
  );
}