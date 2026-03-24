import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, doc, collectionGroup } from 'firebase/firestore';
import './PlayersPage.css';

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

const teamThemes = {
  csk:  { gradient: 'radial-gradient(circle at 30% 20%, #fbbf24 0%, #1c1838 60%)', dot: '#fbbf24', abbr: 'CSK' },
  mi:   { gradient: 'radial-gradient(circle at 30% 20%, #3b82f6 0%, #0f172a 60%)', dot: '#60a5fa', abbr: 'MI'  },
  rcb:  { gradient: 'radial-gradient(circle at 30% 20%, #ef4444 0%, #1a0a0a 60%)', dot: '#f87171', abbr: 'RCB' },
  kkr:  { gradient: 'radial-gradient(circle at 30% 20%, #7c3aed 0%, #0f0a1e 60%)', dot: '#a78bfa', abbr: 'KKR' },
  dc:   { gradient: 'radial-gradient(circle at 30% 20%, #2563eb 0%, #0c1b3a 60%)', dot: '#60a5fa', abbr: 'DC'  },
  gt:   { gradient: 'radial-gradient(circle at 30% 20%, #06b6d4 0%, #042f2e 60%)', dot: '#22d3ee', abbr: 'GT'  },
  rr:   { gradient: 'radial-gradient(circle at 30% 20%, #ec4899 0%, #1d0520 60%)', dot: '#f472b6', abbr: 'RR'  },
  srh:  { gradient: 'radial-gradient(circle at 30% 20%, #f97316 0%, #1c0d00 60%)', dot: '#fb923c', abbr: 'SRH' },
  pbks: { gradient: 'radial-gradient(circle at 30% 20%, #e11d48 0%, #200c14 60%)', dot: '#fb7185', abbr: 'PBKS'},
};

const teamLogos = {
  csk: cskLogo, dc: dcLogo, gt: gtLogo, kkr: kkrLogo, mi: miLogo,
  pbks: pbksLogo, rcb: rcbLogo, rr: rrLogo, srh: srhLogo
};

const PlayersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [liveStats, setLiveStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribePlayers = onSnapshot(query(collectionGroup(db, 'roster')), (snapshot) => {
      const playerList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const teamCompare = (a.team || '').localeCompare(b.team || '');
          if (teamCompare !== 0) return teamCompare;
          return (a.name || '').localeCompare(b.name || '');
        });
      setPlayers(playerList);
      setLoading(false);
    });

    const unsubscribeLive = onSnapshot(doc(db, 'settings', 'teamScores'), (snap) => {
      if (snap.exists()) {
        const statsMap = {};
        snap.data().teams?.forEach(t => {
          t.players?.forEach(p => {
            const data = { points: p.runs || p.points || 0, matches: p.matches || 0 };
            if (p.id) statsMap[p.id] = data;
            if (p.name) statsMap[p.name.trim().toLowerCase()] = data;
          });
        });
        setLiveStats(statsMap);
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeLive();
    };
  }, []);

  const filteredPlayers = players.filter(player => {
    const name = player.name || '';
    const team = player.team || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           team.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="players-page">
      <div className="players-page-header">
        <h1 className="players-page-title">ALL PLAYERS</h1>
        <p className="players-page-subtitle">SEARCH AND FILTER PLAYERS ACROSS ALL TEAMS</p>
      </div>

      <div className="players-search-container">
        <div className="players-search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="SEARCH PLAYER OR TEAM..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="players-count-tag">
        DATABASE ENTRIES: <span>{filteredPlayers.length}</span>
      </div>

      {loading ? (
        <div className="players-loading">
          <div className="players-spinner"></div>
          <p>ACCESSING PLAYER DATABASE...</p>
        </div>
      ) : (
        <div className="players-grid">
          {filteredPlayers.map((player, index) => {
            const tid = (player.team || '').toLowerCase();
            const theme = teamThemes[tid] || { gradient: 'radial-gradient(circle at 30% 20%, #4f46e5 0%, #0f0f1e 60%)', dot: '#818cf8', abbr: (player.team||'T').substring(0,3).toUpperCase() };
            const stats = liveStats[player.id] || liveStats[(player.name || '').trim().toLowerCase()] || { matches: player.matches || 0, points: player.points || player.runs || 0 };
            
            return (
              <div
                key={player.id}
                className="pp-card"
                style={{ '--pp-gradient': theme.gradient, '--pp-dot': theme.dot, animationDelay: `${index * 0.04}s` }}
              >
                <div className="pp-card-bg" />
                <div className="pp-card-dot" />
                <div className="pp-card-number">#{index + 1}</div>

                <div className="pp-card-header">
                  <div className="pp-team-info">
                    {teamLogos[tid] && <img src={teamLogos[tid]} alt={player.team} className="pp-team-logo" />}
                    <span className="pp-team-name">{player.team?.toUpperCase()}</span>
                  </div>
                  <div className="pp-role-badge">{(player.role || 'Player').toUpperCase()}</div>
                </div>

                <div className="pp-card-main">
                  <h2 className="pp-player-name">{player.name}</h2>
                  <div className="pp-avatar">
                    <span>{(player.name || '?').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase()}</span>
                  </div>
                </div>

                <div className="pp-card-stats">
                  <div className="pp-stat-item">
                    <span className="stat-label">MATCHES</span>
                    <span className="stat-value">{stats.matches}</span>
                  </div>
                  <div className="pp-stat-item">
                    <span className="stat-label">POINTS</span>
                    <span className="stat-value" style={{ color: theme.dot }}>{stats.points}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
