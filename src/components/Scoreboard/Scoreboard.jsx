import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './Scoreboard.css';

const Scoreboard = () => {
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'liveScore'), (snapshot) => {
      if (snapshot.exists()) {
        setScores(snapshot.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="scoreboard-loading cyber-bg">INITIALIZING LIVE FEED...</div>;

  const matchData = scores || {
    teamA: 'Team A',
    teamB: 'Team B',
    scoreA: '0/0',
    scoreB: '0/0',
    overs: '0.0'
  };

  return (
    <div className="scoreboard-container premium-glass-theme">
      <div className="scoreboard-header">
        <h1 className="scoreboard-title pulse">LIVE ARENA</h1>
        <p className="scoreboard-subtitle">REAL-TIME MATCH ANALYTICS</p>
      </div>

      <div className="scoreboard-main-layout">
        <div className="cyber-glow-card live-status-bar">
          <div className="status-badge pulse">LIVE</div>
          <div className="stadium-info">CHAMP LEAGUE SEASON 2026 | MAIN STADIUM</div>
        </div>

        <div className="cyber-grid">
          {/* Team A */}
          <div className="cyber-card team-score-panel">
            <div className="team-header">
              <span className="team-glitch-icon">🏏</span>
              <div className="name-rr">
                <h2>{matchData.teamA}</h2>
                <div className="cyber-tag blue">CURRENT INNINGS</div>
              </div>
            </div>
            <div className="team-score-display">
              <span className="current-runs">{matchData.scoreA.split('/')[0]}</span>
              <span className="slash">/</span>
              <span className="wickets">{matchData.scoreA.split('/')[1] || '0'}</span>
              <div className="overs-tag">{matchData.overs} OVERS</div>
            </div>
          </div>

          {/* Team B */}
          <div className="cyber-card team-score-panel secondary highlight-yellow">
            <div className="team-header">
              <span className="team-glitch-icon">🦁</span>
              <div className="name-rr">
                <h2>{matchData.teamB}</h2>
                <div className="cyber-tag yellow">CHASE MODE</div>
              </div>
            </div>
            <div className="team-score-display">
              <span className="current-runs">{matchData.scoreB.split('/')[0]}</span>
              <span className="slash">/</span>
              <span className="wickets">{matchData.scoreB.split('/')[1] || '0'}</span>
              <div className="overs-tag">TARGET CHASE</div>
            </div>
          </div>
        </div>

        <div className="cyber-stats-row">
          <div className="cyber-card partnership-module">
            <div className="module-title">WIN PROBABILITY</div>
            <div className="partnership-data">
              <span className="p-runs-total">65%</span>
              <span className="p-balls-count">TO WIN</span>
              <div className="p-breakdown">
                <span>{matchData.teamA}: 35%</span>
                <span className="divider">|</span>
                <span>{matchData.teamB}: 65%</span>
              </div>
            </div>
          </div>

          <div className="cyber-card players-module">
            <div className="module-title">BATSMEN ON CREASE</div>
            <div className="player-rows">
              <div className="player-row striker">
                <span className="p-name">ACTIVE BATSMAN*</span>
                <span className="p-score">34 (21)</span>
              </div>
              <div className="player-row">
                <span className="p-name">SUPPORTING BATSMAN</span>
                <span className="p-score">12 (10)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card balls-module">
          <div className="module-title">RECENT DELIVERIES</div>
          <div className="cyber-balls-row">
            {['4','1','6','0','W','2','1','.','6','1','.','2'].map((b, i) => (
              <div key={i} className={`cyber-ball ${b === 'W' ? 'wicket' : b === '6' ? 'six' : b === '4' ? 'four' : ''}`}>
                {b === '.' ? '0' : b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
