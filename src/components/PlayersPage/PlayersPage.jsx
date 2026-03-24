import React, { useState, useEffect } from 'react';
import './PlayersPage.css';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const PlayersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [liveScores, setLiveScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('name'));
    const unsubscribePlayers = onSnapshot(q, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playerList);
      setLoading(false);
    });

    const unsubscribeScores = onSnapshot(doc(db, 'settings', 'teamScores'), (snap) => {
      if (snap.exists()) {
        const scoresMap = {};
        snap.data().teams?.forEach(t => {
          t.players?.forEach(p => {
            scoresMap[p.id] = p.runs;
          });
        });
        setLiveScores(scoresMap);
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

  if (loading) return <div className="loading-players">LOADING DATABASE...</div>;

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
                <span className="team-glitch-icon">🏏</span>
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
                <span className="stat-value">{player.matches || 0}</span>
              </div>
              <div className="cyber-stat-row highlight-cyan full-width-stat">
                <span className="stat-label">LEAGUE POINTS</span>
                <span className="stat-value">{liveScores[player.id] || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersPage;
