import React, { useState } from 'react';
import { authService } from '../firebase';
import { AlertCircle } from 'lucide-react';

interface SignInProps {
  onAuthSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-fog)',
      padding: '32px 20px'
    }}>
      <div style={{ zIndex: 1, width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Brand Logo and Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Workflow Zero Logo" 
            style={{ height: '40px', objectFit: 'contain', marginBottom: '8px' }}
          />
          <h1 style={{ 
            fontSize: 'var(--text-heading-lg)', 
            fontFamily: 'var(--font-aeonikpro)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            letterSpacing: 'var(--tracking-heading-lg)'
          }}>
            Workflow Zero CRM
          </h1>
          <p style={{ 
            fontSize: 'var(--text-body)', 
            color: 'var(--color-graphite)',
            fontFamily: 'var(--font-untitled-sans)'
          }}>
            Sign in to your client workspace.
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              display: 'flex',
              gap: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              color: 'var(--color-caution)',
              fontSize: 'var(--text-body)',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ 
                fontSize: 'var(--text-caption)', 
                color: 'var(--color-graphite)',
                fontFamily: 'var(--font-untitled-sans)',
                fontWeight: 600
              }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-minimal"
                placeholder="you@workflowzeroit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ 
                  fontSize: 'var(--text-caption)', 
                  color: 'var(--color-graphite)',
                  fontFamily: 'var(--font-untitled-sans)',
                  fontWeight: 600
                }}>
                  Password
                </label>
              </div>
              <input
                type="password"
                className="input-minimal"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn-solid-primary"
              disabled={loading}
              style={{ marginTop: '8px', padding: '12px' }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
