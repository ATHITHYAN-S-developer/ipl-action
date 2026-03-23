import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';

const TeamsGrid = ({ teams, loading, error, onViewSquad }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <section className="teams-page-container" ref={containerRef} onMouseMove={handleMouseMove}>
      <div className="teams-page-header">
        <h1 className="section-title-premium scale-in">PREMIUM LEAGUE CONTENDERS</h1>
        <p className="section-subtitle-premium">OFFICIAL ROSTER DATA SYNCED WITH CLOUD</p>
      </div>
      
      {loading ? (
        <div className="cyber-loading">
          <div className="loading-spinner"></div>
          <p>RETRIEVING TEAM DATA...</p>
        </div>
      ) : teams.length > 0 ? (
        <div className="teams-grid-premium">
          {teams.map((team, index) => (
            <TeamCardPremium key={team.id} team={team} index={index} mousePos={mousePos} onViewSquad={onViewSquad} />
          ))}
        </div>
      ) : (
        <div className="no-teams-container-glass">
          <p className="no-data-text">NO TEAMS FOUND IN SYSTEM</p>
          <p className="hint-text">Admin must initialize the league roster in the dashboard.</p>
        </div>
      )}
    </section>
  );
};

const TeamCardPremium = ({ team, index, mousePos, onViewSquad }) => {
  const cardRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const getTeamIcon = (name) => {
    if (team.icon) return team.icon;
    const n = (name || '').toLowerCase();
    if (n.includes('mumbai')) return '🏏';
    if (n.includes('chennai')) return '🦁';
    if (n.includes('royal')) return '👑';
    return '🛡️';
  };

  const getTeamColor = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('mumbai')) return '#00ffff';
    if (n.includes('chennai')) return '#fccf14';
    if (n.includes('royal')) return '#e53e3e';
    if (n.includes('delhi')) return '#0088ff';
    if (n.includes('kolkata')) return '#805ad5';
    return '#fccf14';
  };

  const teamColor = getTeamColor(team.name);

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = mousePos.x - (centerX - window.scrollX);
      const dy = mousePos.y - (centerY - window.scrollY);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 250) {
        const force = (250 - dist) / 250;
        setTranslate({ x: (dx / dist) * -15 * force, y: (dy / dist) * -15 * force });
      } else {
        setTranslate({ x: 0, y: 0 });
      }
    }
  }, [mousePos]);

  return (
    <div 
      className="team-card-glass-premium" 
      ref={cardRef}
      style={{
        transform: `translate(${translate.x}px, ${translate.y}px)`,
        borderColor: teamColor,
        animationDelay: `${index * 0.1}s`
      }}
    >
      <div className="card-top-accent" style={{ background: teamColor }}></div>
      <div className="card-glow-bg" style={{ background: `radial-gradient(circle at 50% 0%, ${teamColor}1a 0%, transparent 70%)` }}></div>
      
      <div className="card-header-premium">
        <span className="team-icon-large pulse-gold">{getTeamIcon(team.name)}</span>
        <h3 className="team-display-name">{(team.name || 'UNKNOWN').toUpperCase()}</h3>
      </div>
      
      <div className="card-stats-premium">
        <div className="stat-row">
          <span className="label">BUDGET LEFT</span>
          <span className="value highlight-yellow">₹{(team.budget || 80) - (team.spent || 0)} Cr</span>
        </div>
        <div className="stat-row">
          <span className="label">TOTAL SPENT</span>
          <span className="value">₹{team.spent || 0} Cr</span>
        </div>
      </div>

      <button 
        className="view-squad-btn-premium" 
        onClick={() => onViewSquad(team)}
        style={{ borderColor: teamColor, '--hover-color': teamColor }}
      >
        VIEW SQUAD MATRIX
      </button>
    </div>
  );
};

export default TeamsGrid;
