import React, { useState, useEffect, useRef } from 'react';
import './TeamsGrid.css';

import pbskLogo from '../../assets/teams images/PBSK.webp';
import cskLogo from '../../assets/teams images/csk.png';
import dcLogo from '../../assets/teams images/dc.png';
import gtLogo from '../../assets/teams images/gt.jpg';
import kkrLogo from '../../assets/teams images/kkr.png';
import miLogo from '../../assets/teams images/mi.jpg';
import rcbLogo from '../../assets/teams images/rcb.webp';
import rrLogo from '../../assets/teams images/rr.png';
import srhLogo from '../../assets/teams images/srh.png';

const teamThemes = {
  csk:  { gradient: 'radial-gradient(circle at 30% 20%, #fbbf24 0%, #1c1838 60%)', dot: '#fbbf24',  abbr: 'CSK' },
  mi:   { gradient: 'radial-gradient(circle at 30% 20%, #3b82f6 0%, #0f172a 60%)', dot: '#60a5fa',  abbr: 'MI'  },
  rcb:  { gradient: 'radial-gradient(circle at 30% 20%, #ef4444 0%, #1a0a0a 60%)', dot: '#f87171',  abbr: 'RCB' },
  kkr:  { gradient: 'radial-gradient(circle at 30% 20%, #7c3aed 0%, #0f0a1e 60%)', dot: '#a78bfa',  abbr: 'KKR' },
  dc:   { gradient: 'radial-gradient(circle at 30% 20%, #2563eb 0%, #0c1b3a 60%)', dot: '#60a5fa',  abbr: 'DC'  },
  gt:   { gradient: 'radial-gradient(circle at 30% 20%, #06b6d4 0%, #042f2e 60%)', dot: '#22d3ee',  abbr: 'GT'  },
  rr:   { gradient: 'radial-gradient(circle at 30% 20%, #ec4899 0%, #1d0520 60%)', dot: '#f472b6',  abbr: 'RR'  },
  srh:  { gradient: 'radial-gradient(circle at 30% 20%, #f97316 0%, #1c0d00 60%)', dot: '#fb923c',  abbr: 'SRH' },
  pbks: { gradient: 'radial-gradient(circle at 30% 20%, #e11d48 0%, #200c14 60%)', dot: '#fb7185',  abbr: 'PBKS'},
};

const TeamsGrid = ({ teams, loading, error, onViewSquad }) => {
  return (
    <section className="tgrid-section">
      <div className="tgrid-header">
        <h1 className="tgrid-title">PREMIUM LEAGUE CONTENDERS</h1>
        <p className="tgrid-subtitle">OFFICIAL ROSTER DATA SYNCED WITH CLOUD</p>
      </div>

      {loading ? (
        <div className="tgrid-loading">
          <div className="tgrid-spinner"></div>
          <p>RETRIEVING TEAM DATA...</p>
        </div>
      ) : teams.length > 0 ? (
        <div className="tgrid-grid">
          {teams.map((team, index) => (
            <TeamCard key={team.id} team={team} index={index} onViewSquad={onViewSquad} />
          ))}
        </div>
      ) : (
        <div className="tgrid-empty">
          <p>NO TEAMS FOUND IN SYSTEM</p>
          <span>Admin must initialize the league roster in the dashboard.</span>
        </div>
      )}
    </section>
  );
};

const getTeamImage = (id) => {
  const normalizedId = (id || '').toLowerCase();
  switch (normalizedId) {
    case 'pbks': return pbskLogo;
    case 'csk':  return cskLogo;
    case 'dc':   return dcLogo;
    case 'gt':   return gtLogo;
    case 'kkr':  return kkrLogo;
    case 'mi':   return miLogo;
    case 'rcb':  return rcbLogo;
    case 'rr':   return rrLogo;
    case 'srh':  return srhLogo;
    default:     return null;
  }
};

const TeamCard = ({ team, index, onViewSquad }) => {
  const id = (team.id || '').toLowerCase();
  const theme = teamThemes[id] || { gradient: 'radial-gradient(circle at 30% 20%, #4f46e5 0%, #0f0f1e 60%)', dot: '#818cf8', abbr: (team.name || 'T').substring(0,3).toUpperCase() };
  const teamImg = getTeamImage(team.id);
  const budgetLeft = (team.budget || 80) - (team.spent || 0);

  return (
    <div
      className="tcard"
      style={{ '--tcard-gradient': theme.gradient, '--tcard-dot': theme.dot, animationDelay: `${index * 0.08}s` }}
    >
      {/* background gradient blob */}
      <div className="tcard-bg" />

      {/* dot accent */}
      <div className="tcard-dot" />

      {/* avatar */}
      <div className="tcard-avatar">
        {teamImg ? (
          <img src={teamImg} alt={team.name} className="tcard-logo" />
        ) : (
          <span className="tcard-abbr">{theme.abbr}</span>
        )}
      </div>

      {/* info */}
      <div className="tcard-info">
        <h3 className="tcard-name">{(team.name || 'UNKNOWN')}</h3>
        <p className="tcard-role">{theme.abbr} • IPL FRANCHISE</p>
      </div>

      {/* tags */}
      <div className="tcard-tags">
        <span className="tcard-tag">₹{budgetLeft} Cr Left</span>
        <span className="tcard-tag">₹{team.spent || 0} Cr Spent</span>
        {team.playerCount > 0 && <span className="tcard-tag">{team.playerCount} Players</span>}
      </div>

      {/* CTA */}
      <button className="tcard-btn" onClick={() => onViewSquad(team)}>
        VIEW SQUAD MATRIX
      </button>
    </div>
  );
};

export default TeamsGrid;
