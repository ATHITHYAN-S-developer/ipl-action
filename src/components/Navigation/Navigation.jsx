import React from 'react';
import './Navigation.css';
import sponsorLogo from '../../assets/sponsor-logo-removebg-preview.png';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'teams', label: 'Teams', icon: '👥' },
    { id: 'players', label: 'Players', icon: '🏏' },
    { id: 'scoreboard', label: 'Scoreboard', icon: '📊' },
    { id: 'auction', label: 'Auction Dashboard', icon: '🔨' },
    { id: 'feedback', label: 'Feedback', icon: '💬' }
  ];

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="nav-logo"><img src={sponsorLogo} alt="" className="lp-badge-logo" /></span>
          <span className="nav-title">Champ Inter District E - Ryla</span>
        </div>

        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${tab.id === 'auction' ? 'nav-tab-auction' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="nav-tab-icon">{tab.icon}</span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="nav-divider"></div>
    </nav>
  );
};

export default Navigation;
