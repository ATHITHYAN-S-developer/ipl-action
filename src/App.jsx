import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage/LoginPage';
import HomePage from './components/HomePage/HomePage';
import AdminPage from './components/AdminPage/AdminPage';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for local storage admin session
    const savedAdmin = localStorage.getItem('isAdmin');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
    if (savedUserData) {
      setUser(JSON.parse(savedUserData));
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !user) {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = (role, userData) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    if (role === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="App" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020b18', color: 'white' }}>
        <div className="loading-screen" style={{ fontFamily: 'Orbitron', letterSpacing: '2px' }}>VERIFYING PORTAL ACCESS...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAdmin ? (
        <AdminPage onLogout={handleLogout} />
      ) : user ? (
        <HomePage user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
