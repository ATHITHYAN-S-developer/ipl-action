import React, { useState, useEffect } from 'react';
import './PlayersPage.css';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const PlayersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playerList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filters = ['All', 'Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];

  const filteredPlayers = players.filter(player => {
    const playerName = player.name || '';
    const playerTeam = player.team || '';
    const matchesSearch = playerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          playerTeam.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || player.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="loading-players">LOADING DATABASE...</div>;

  return (
    <div className="players-container cyber-bg">
      <div className="players-header cyber-glow-card">
        <h1 className="players-title pulse">All Players</h1>
        <p className="players-subtitle highlight-yellow">Search and filter players across all teams</p>
      </div>

      <div className="search-filter-section cyber-card no-after">
        <div className="search-bar-container cyber-input-group">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="SEARCH DATABASE..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {filters.map(filter => (
            <button 
              key={filter} 
              className={`filter-btn cyber-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.toUpperCase()}
            </button>
          ))}
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
              <div className="cyber-stat-row highlight-cyan">
                <span className="stat-label">RUNS</span>
                <span className="stat-value">{player.runs || 0}</span>
              </div>
              <div className="cyber-stat-row highlight-red">
                <span className="stat-label">WICKETS</span>
                <span className="stat-value">{player.wickets || 0}</span>
              </div>
              <div className="cyber-stat-row highlight-yellow">
                <span className="stat-label">AVERAGE</span>
                <span className="stat-value">{player.average || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersPage;
