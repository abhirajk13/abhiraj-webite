import { useState } from 'react';
import { loginWithEmail } from '../../services/authService';
import { LockIcon, AlertIcon, XIcon } from './Icons';
import './MealPrep.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithEmail(email, password);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="mp-portal">
      <div className="mp-login">
        <div className="mp-login-grid" />
        
        <div className="mp-login-card">
          <div className="mp-login-brand">
            <LockIcon size={20} />
          </div>
          
          <div className="mp-login-header">
            <h1>Sign in</h1>
            <p>Access your private workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="mp-login-form">
            {error && (
              <div className="mp-alert">
                <AlertIcon size={16} />
                <span>{error}</span>
                <button type="button" className="mp-alert-close" onClick={() => setError('')}>
                  <XIcon size={14} />
                </button>
              </div>
            )}

            <div className="mp-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="mp-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="mp-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="mp-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="mp-btn mp-btn-primary mp-btn-block mp-btn-lg"
              disabled={loading}
              style={{ marginTop: '4px' }}
            >
              {loading ? (
                <>
                  <span className="mp-spinner"></span>
                  Signing in
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
