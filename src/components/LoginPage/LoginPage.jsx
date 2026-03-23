import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import sponsorLogo from '../../assets/sponsor-logo-removebg-preview.png';
import './LoginPage.css';

// ── Constants ──────────────────────────────────────────────────────────────────
const NUM_PARTICLES = 30;

// ── Floating particle ──────────────────────────────────────────────────────────
function Particle({ id }) {
  const symbols = [ '🏆', '🔥', '⚡', '★', '◆'];
  const [style] = useState(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    fontSize: `${10 + Math.random() * 18}px`,
    animationDuration: `${10 + Math.random() * 10}s`,
    animationDelay: `${Math.random() * 5}s`,
    opacity: 0.1 + Math.random() * 0.2,
  }));
  return (
    <div className="lp-particle" style={style}>
      {symbols[id % symbols.length]}
    </div>
  );
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Query Firestore for user credentials
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', identity), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        onLogin(userData.role, userData);
        setLoading(false);
        return;
      }

      // If not in custom users collection, try standard Firebase Auth (as fallback or for other teams)
      const email = identity.includes('@') ? identity : `${identity}@iplauction.com`;
      await signInWithEmailAndPassword(auth, email, password);
      // If sign in succeeds but not in 'users' collection, treat as regular user
      onLogin('user', { email });
      
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message === 'Invalid Credentials') {
        setError('ACCESS DENIED: Invalid Credentials.');
      } else {
        setError('ERROR: Verification failed. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-wrapper">
      <div className="lp-bg-fixed">
        <div className="lp-orb lp-orb1" />
        <div className="lp-orb lp-orb2" />
        {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
          <Particle key={i} id={i} />
        ))}
      </div>

      <div className="lp-content-container">
        <header>
          <div className="lp-badge">
            <img src={sponsorLogo} alt="" className="lp-badge-logo" />
            OFFICIAL LEAGUE PORTAL
          </div>

          <h1 className="lp-title-main">
            WELCOME TO CHAMP&nbsp;E<br />
            <span className="lp-accent-gold">RYLA LEADERSHIP PREMIUM LEAGUE</span>
          </h1>
          <p className="lp-subtitle">PREMIUM CRICKET EXPERIENCE • ELITE COMPETITION</p>
        </header>

        <div className="lp-card-glass">
          <div className="lp-card-header">IDENTITY VERIFICATION</div>
          <div className="lp-card-divider" />

          <form className="lp-login-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '12px', marginBottom: '25px',
                background: 'rgba(255,77,77,0.1)',
                border: '1px solid rgba(255,77,77,0.2)',
                borderRadius: '12px', fontSize: '0.8rem',
                fontWeight: '700', textAlign: 'center', color: '#ff4d4d'
              }}>
                {error}
              </div>
            )}

            <div className="lp-input-group">
              <label>USERNAME / TEAM ID</label>
              <div className="lp-input-field-wrapper">
                <span className="lp-input-icon">👤</span>
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lp-input-group">
              <label>ACCESS KEY</label>
              <div className="lp-input-field-wrapper">
                <span className="lp-input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="lp-btn-primary" disabled={loading}>
              {loading ? 'VERIFYING...' : 'INITIATE ACCESS'}
            </button>
          </form>
        </div>

        <div className="lp-metrics-grid">
          <div className="lp-metric-item">
            <div className="lp-metric-value">10</div>
            <div className="lp-metric-label">TEAMS</div>
          </div>
          <div className="lp-v-divider" />
          <div className="lp-metric-item">
            <div className="lp-metric-value">600+</div>
            <div className="lp-metric-label">MEMBERS</div>
          </div>
          <div className="lp-v-divider" />
          <div className="lp-metric-item">
            <div className="lp-metric-value">₹500C</div>
            <div className="lp-metric-label">REVENUE</div>
          </div>
        </div>

        <p className="lp-footer-text">© 2026 CHAMP INTER DISTRICT E - RYLA | ELITE PORTAL</p>
      </div>
    </div>
  );
};

export default LoginPage;
