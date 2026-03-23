import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import './SquadPage.css';

const SquadPage = ({ team, onBack }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [squadMembers, setSquadMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];

  useEffect(() => {
    const q = query(
      collection(db, 'players'),
      where('team', '==', team.name)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setSquadMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [team.name]);

  const filteredMembers = squadMembers.filter(member => 
    activeFilter === 'All' || member.role === activeFilter
  );

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

  return (
    <div className="squad-container">
      <button className="back-btn-premium" onClick={onBack}>
        <span className="back-arrow">←</span> COMMAND: RETURN TO ALL TEAMS
      </button>

      {loading ? (
        <div className="cyber-loading">
          <div className="loading-spinner"></div>
          <p>ACCESSING SQUAD MATRIX...</p>
        </div>
      ) : (
        <>
          <div className="squad-header-banner-premium" style={{ borderLeft: `8px solid ${teamColor}` }}>
            <div className="banner-glow-overlay" style={{ 
              background: `radial-gradient(circle at 70% 50%, ${teamColor}1a 0%, transparent 70%)` 
            }}></div>
            <div className="banner-content-premium">
              <span className="banner-emoji-premium pulse-gold">{getTeamIcon(team.name)}</span>
              <div className="banner-text-premium">
                <h1 className="banner-team-name-premium">{(team.name || '').toUpperCase()}</h1>
                <div className="banner-info-premium">
                  <div className="info-tag-premium">
                    <span className="label">TREASURY LEFT</span>
                    <span className="value accent-gold">₹{(team.budget || 80) - (team.spent || 0)} Cr</span>
                  </div>
                  <div className="info-tag-premium">
                    <span className="label">SQUAD ENTRIES</span>
                    <span className="value">{squadMembers.length} ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="squad-section-premium">
            <div className="squad-filters-cyber" style={{ marginBottom: '40px' }}>
              {filters.map(filter => (
                <button 
                  key={filter} 
                  className={`squad-filter-btn cyber-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                  style={{ borderRadius: '12px', fontSize: '0.7rem' }}
                >
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="squad-grid-premium">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => (
                  <div key={member.id} className="player-card-premium" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="player-card-bg-number">{index + 1}</div>
                    <div className="role-badge-premium">{(member.role || 'PLAYER').toUpperCase()}</div>
                    <h2 className="player-display-name-premium">{member.name}</h2>
                    
                    <div className="player-stats-premium">
                      <div className="stat-item-premium">
                        <span className="label">MATCHES</span>
                        <span className="value">{member.matches || 0}</span>
                      </div>
                      <div className="stat-item-premium">
                        <span className="label">RUNS</span>
                        <span className="value" style={{ color: '#00ffff' }}>{member.runs || 0}</span>
                      </div>
                      <div className="stat-item-premium">
                        <span className="label">WICKETS</span>
                        <span className="value" style={{ color: '#ff4d4d' }}>{member.wickets || 0}</span>
                      </div>
                      <div className="stat-item-premium">
                        <span className="label">SR/AVG</span>
                        <span className="value" style={{ color: '#fccf14' }}>{member.average || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-squad-msg" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', opacity: 0.3 }}>
                  <p>NO PLAYERS REGISTERED IN THIS SQUAD DATA-FIELD.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SquadPage;
