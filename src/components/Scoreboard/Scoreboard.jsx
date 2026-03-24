import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './Scoreboard.css';

// Team logo imports
import srhLogo  from '../../assets/teams images/srh.png';
import rrLogo   from '../../assets/teams images/rr.png';
import rcbLogo  from '../../assets/teams images/rcb.webp';
import pbksLogo from '../../assets/teams images/PBSK.webp';
import miLogo   from '../../assets/teams images/mi.jpg';
import kkrLogo  from '../../assets/teams images/kkr.png';
import gtLogo   from '../../assets/teams images/gt.jpg';
import dcLogo   from '../../assets/teams images/dc.png';
import cskLogo  from '../../assets/teams images/csk.png';

// Static config (logos + colors only — scores/names come from Firestore)
const TEAM_CONFIG = {
  srh:  { logo: srhLogo,  color: '#FF6B35', glow: 'rgba(255,107,53,0.4)' },
  rr:   { logo: rrLogo,   color: '#FF4FC8', glow: 'rgba(255,79,200,0.4)' },
  rcb:  { logo: rcbLogo,  color: '#E53E3E', glow: 'rgba(229,62,62,0.4)'  },
  pbks: { logo: pbksLogo, color: '#E53E3E', glow: 'rgba(229,62,62,0.4)'  },
  mi:   { logo: miLogo,   color: '#0088FF', glow: 'rgba(0,136,255,0.4)'  },
  kkr:  { logo: kkrLogo,  color: '#7B2FBE', glow: 'rgba(123,47,190,0.4)' },
  gt:   { logo: gtLogo,   color: '#00D4AA', glow: 'rgba(0,212,170,0.4)'  },
  dc:   { logo: dcLogo,   color: '#4169E1', glow: 'rgba(65,105,225,0.4)' },
  csk:  { logo: cskLogo,  color: '#FCC201', glow: 'rgba(252,194,1,0.4)'  },
};

// ─── Static league scorecard data ───────────────────────────────────────────
const TEAMS = [
  { id: 'srh',  name: 'SRH',  totalScore: 0, players: [] },
  { id: 'rr',   name: 'RR',   totalScore: 0, players: [] },
  { id: 'rcb',  name: 'RCB',  totalScore: 0, players: [] },
  { id: 'pbks', name: 'PBKS', totalScore: 0, players: [] },
  { id: 'mi',   name: 'MI',   totalScore: 0, players: [] },
  { id: 'kkr',  name: 'KKR',  totalScore: 0, players: [] },
  { id: 'gt',   name: 'GT',   totalScore: 0, players: [] },
  { id: 'dc',   name: 'DC',   totalScore: 0, players: [] },
  { id: 'csk',  name: 'CSK',  totalScore: 0, players: [] },
];

// ─── Component ───────────────────────────────────────────────────────────────
const Scoreboard = () => {
  const [expandedTeam, setExpandedTeam]   = useState(null);
  const [liveTeams,    setLiveTeams]      = useState(null);   // from Firestore
  const [loading,      setLoading]        = useState(true);
  const [searchQuery,  setSearchQuery]    = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'teamScores'), (snap) => {
      if (snap.exists() && snap.data().teams) {
        setLiveTeams(snap.data().teams);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Merge Firestore data with static logo/color config
  const teams = (liveTeams || TEAMS).map(t => ({
    ...t,
    ...(TEAM_CONFIG[t.id] || {}),
  })).sort((a,b) => (b.totalScore || 0) - (a.totalScore || 0));

  const filteredTeams = teams.map(t => {
    const matchingPlayers = (t.players || []).filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...t, hasMatch: matchingPlayers.length > 0 || t.name.toLowerCase().includes(searchQuery.toLowerCase()) };
  }).filter(t => !searchQuery || t.hasMatch);

  const toggleTeam = (id) => setExpandedTeam(expandedTeam === id ? null : id);

  if (loading) return (
    <div className="scoreboard-container premium-glass-theme" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#00ffff', fontFamily:'Krona One', letterSpacing:'2px' }}>LOADING SCOREBOARD...</p>
    </div>
  );

  return (
    <div className="scoreboard-container premium-glass-theme">
      {/* Header */}
      <div className="scoreboard-header">
        <h1 className="scoreboard-title pulse">LEAGUE ARENA</h1>
        <p className="scoreboard-subtitle">CHAMP INTER DISTRICT E - RYLA | SEASON 2026</p>
        
        <div className="sb-search-wrap">
          <input 
            type="text" 
            placeholder="Search Player or Team..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sb-search-input"
          />
          <span className="sb-search-icon">🔍</span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="sb-summary-bar">
        <div className="sb-summary-item">
          <span className="sb-sum-val">{teams.length}</span>
          <span className="sb-sum-label">TEAMS</span>
        </div>
        <div className="sb-summary-divider" />
        <div className="sb-summary-item">
          <span className="sb-sum-val">{Math.max(...teams.map(t => t.totalScore || 0))}</span>
          <span className="sb-sum-label">TOP SCORE</span>
        </div>
        <div className="sb-summary-divider" />
        <div className="sb-summary-item">
          <span className="sb-sum-val" style={{ color: '#00ff88' }}>ACTIVE</span>
          <span className="sb-sum-label">PORTAL</span>
        </div>
      </div>

      {/* Team cards */}
      <div className="sb-teams-list">
        {filteredTeams.map((team, idx) => {
          const isOpen = expandedTeam === team.id || (searchQuery && team.hasMatch);
          return (
            <div
              key={team.id}
              className={`sb-team-card ${isOpen ? 'expanded' : ''}`}
              style={{ '--team-color': team.color || '#00ffff', '--team-glow': team.glow || 'rgba(0,255,255,0.3)' }}
            >
              {/* ── Collapsed row ── */}
              <div className="sb-team-row" onClick={() => toggleTeam(team.id)}>
                <div className="sb-team-rank">#{idx + 1}</div>

                <div className="sb-team-icon">
                  {team.logo
                    ? <img src={team.logo} alt={team.name} className="sb-team-logo" />
                    : <span style={{ fontSize:'1.4rem' }}>🏏</span>}
                </div>

                <div className="sb-team-info">
                  <span className="sb-team-shortname">{team.name}</span>
                </div>

                <div className="sb-team-score-block">
                  <div className="sb-score-flex">
                    <span className="sb-score-runs" style={{ color: team.color, textShadow: `0 0 20px ${team.color}` }}>
                      {team.totalScore}
                    </span>
                    <span className="sb-score-divider">/</span>
                    <span className="sb-score-total">140</span>
                  </div>
                  <span className="sb-score-wkts" style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>TEAM POINTS</span>
                </div>

                <div className="sb-score-bar-wrap">
                  <div
                    className="sb-score-bar-fill"
                    style={{ width: `${Math.min((team.totalScore / 200) * 100, 100)}%`, background: team.color, boxShadow: `0 0 8px ${team.color}` }}
                  />
                </div>

                <button className="sb-expand-btn" style={{ color: team.color }}>
                  {isOpen ? '▲ HIDE' : '▼ PLAYERS'}
                </button>
              </div>

              {/* ── Expanded player scorecard ── */}
              {isOpen && (
                <div className="sb-player-table">
                  <table>
                    <thead>
                      <tr>
                        <th>PLAYER NAME</th>
                        <th>POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(team.players || []).map((p, i) => (
                        <tr key={i} className={p.name === 'Extras' ? 'extras-row' : ''}>
                          <td className="p-name-cell">{p.name}</td>
                          <td className="p-runs-cell" style={{ color: team.color }}>{p.runs}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td>TEAM TOTAL</td>
                        <td style={{ color: team.color }}>
                          {team.totalScore} / 140
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard;


