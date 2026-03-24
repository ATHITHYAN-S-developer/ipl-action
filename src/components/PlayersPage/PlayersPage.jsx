import React, { useState, useEffect } from 'react';
import './PlayersPage.css';
import { db } from '../../firebase';
import { collection, onSnapshot, query, doc, collectionGroup } from 'firebase/firestore';

// Team Logos
import cskLogo from '../../assets/teams images/csk.png';
import dcLogo from '../../assets/teams images/dc.png';
import gtLogo from '../../assets/teams images/gt.jpg';
import kkrLogo from '../../assets/teams images/kkr.png';
import miLogo from '../../assets/teams images/mi.jpg';
import pbksLogo from '../../assets/teams images/PBSK.webp';
import rcbLogo from '../../assets/teams images/rcb.webp';
import rrLogo from '../../assets/teams images/rr.png';
import srhLogo from '../../assets/teams images/srh.png';

const teamLogos = {
  csk: cskLogo,
  dc: dcLogo,
  gt: gtLogo,
  kkr: kkrLogo,
  mi: miLogo,
  pbks: pbksLogo,
  rcb: rcbLogo,
  rr: rrLogo,
  srh: srhLogo
};

const PlayersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [liveStats, setLiveStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collectionGroup(db, 'roster'));
    const unsubscribePlayers = onSnapshot(q, (snapshot) => {
      const playerList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const teamCompare = (a.team || '').localeCompare(b.team || '');
          if (teamCompare !== 0) return teamCompare;
          return (a.name || '').localeCompare(b.name || '');
        });
      setPlayers(playerList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error (Players):", error);
      setLoading(false);
    });

    const unsubscribeScores = onSnapshot(doc(db, 'settings', 'teamScores'), (snap) => {
      if (snap.exists()) {
        const statsMap = {};
        snap.data().teams?.forEach(t => {
          t.players?.forEach(p => {
            const data = { runs: p.runs || 0, matches: p.matches || 0 };
            // Map by ID
            if (p.id) statsMap[p.id] = data;
            // Map by Normalized Name as fallback
            if (p.name) {
              statsMap[p.name.trim().toLowerCase()] = data;
            }
          });
        });
        setLiveStats(statsMap);
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeScores();
    };
  }, []);

  const filteredPlayers = players.filter(player => {
    const playerName = player.name || '';
    const playerTeam = player.team || '';
    return playerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           playerTeam.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="loading-players cyber-bg">
      <div className="cyber-loader"></div>
      <div className="loading-text">ACCESSING PLAYER DATABASE...</div>
    </div>
  );

  if (players.length === 0) return (
    <div className="players-container cyber-bg no-players">
      <div className="players-header cyber-glow-card">
        <h1 className="players-title">DATABASE EMPTY</h1>
        <p className="players-subtitle highlight-yellow">No players found in the system roster.</p>
      </div>
      <div className="admin-notice cyber-card">
        <p>Tip: Ensure you have "Bulk Loaded" the teams in the Admin Panel or created players manually.</p>
      </div>
    </div>
  );

  return (
    <div className="players-container cyber-bg">
      <div className="players-header cyber-glow-card">
        <h1 className="players-title pulse">All Players</h1>
        <p className="players-subtitle highlight-yellow">Search and filter players across all teams</p>
      </div>

      <div className="search-filter-section cyber-card no-after">
        <div className="search-bar-container cyber-input-group wide-search">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="SEARCH PLAYER OR TEAM..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="showing-count cyber-tag-count">
        DATABASE ENTRIES: <strong>{filteredPlayers.length}</strong>
      </div>

      <div className="players-grid">
        {filteredPlayers.map((player, index) => (
          <div key={player.id} className={`player-card cyber-card animate-fade-up role-${(player.role || '').toLowerCase().replace('-', '')}`} style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="player-card-bg-number">#{index + 1}</div>
            
            <div className="player-card-header">
              <div className="team-info-cyber">
                {teamLogos[(player.team || '').toLowerCase()] ? (
                  <img 
                    src={teamLogos[(player.team || '').toLowerCase()]} 
                    alt={player.team} 
                    className="player-card-team-logo" 
                  />
                ) : (
                  <span className="team-glitch-icon">🏏</span>
                )}
                <span className="team-name">{player.team}</span>
              </div>
              <div className={`cyber-role-tag`}>
                {(player.role || 'PLAYER').toUpperCase()}
              </div>
            </div>

            <div className="player-card-main">
              <h2 className="player-display-name">{player.name}</h2>
              <div className="cyber-divider"></div>
            </div>

            <div className="player-stats-cyber">
              <div className="cyber-stat-row">
                <span className="stat-label">MATCHES</span>
                <span className="stat-value">
                  {liveStats[player.id]?.matches ?? liveStats[(player.name || '').trim().toLowerCase()]?.matches ?? player.matches ?? 0}
                </span>
              </div>
              <div className="cyber-stat-row">
                <span className="stat-label">LEAGUE POINTS</span>
                <span className="stat-value">
                  {liveStats[player.id]?.runs ?? liveStats[(player.name || '').trim().toLowerCase()]?.runs ?? 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersPage;
