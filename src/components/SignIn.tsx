import React, { useState } from 'react';
import { authService } from '../firebase';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';

interface SignInProps {
  onAuthSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await authService.signUp(email, password);
      } else {
        await authService.signIn(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signIn('demo@workflowzero.local', 'demo123');
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo mode.');
    } finally {
      setLoading(false);
    }
  };

  const isDemo = authService.isDemo();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-midnight-abyss)',
      padding: '20px'
    }}>
      {/* Background ambient light overlay */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(102, 58, 243, 0.08) 0%, rgba(5, 6, 15, 0) 70%)',
        top: '20%',
        left: 'calc(50% - 250px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

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
            fontWeight: 500,
            color: 'var(--color-ghost-white)'
          }}>
            Workflow Zero CRM
          </h1>
          <p style={{ 
            fontSize: 'var(--text-body)', 
            color: 'var(--color-whisper-blue)',
            fontFamily: 'var(--font-untitled-sans)'
          }}>
            {isDemo ? "Run instant preview or connect your custom backend" : "Midnight Control Center login"}
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
              color: '#f87171',
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
                color: 'var(--color-arctic-mist)',
                fontFamily: 'var(--font-untitled-sans)',
                fontWeight: 500
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
                  color: 'var(--color-arctic-mist)',
                  fontFamily: 'var(--font-untitled-sans)',
                  fontWeight: 500
                }}>
                  Password
                </label>
              </div>
              <input
                type="password"
                className="input-minimal"
                placeholder="••••••••"
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
              {loading ? "Authenticating..." : isSignUp ? "Create Workspace Account" : "Access Console"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '8px 0',
            height: '1px',
            background: 'var(--gradient-system-highlight-border)' 
          }} />

          {/* Action buttons to toggle Mode / Demo mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleDemoMode}
              className="btn-primary-pill"
              disabled={loading}
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              <Sparkles size={16} />
              Continue to Demo Mode
            </button>

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-azure-glow)',
                fontSize: 'var(--text-caption)',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'var(--font-untitled-sans)',
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Footnote details */}
        {isDemo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--color-interstellar-gray)',
            fontSize: '11px',
            textAlign: 'center'
          }}>
            <Shield size={12} />
            <span>Running locally. Real Firebase endpoints can be linked in <code>.env</code> file.</span>
          </div>
        )}
      </div>
    </div>
  );
};
