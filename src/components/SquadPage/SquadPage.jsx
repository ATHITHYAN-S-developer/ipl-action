import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import './SquadPage.css';

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
  csk:  { gradient: 'radial-gradient(circle at 30% 20%, #fbbf24 0%, #1c1838 60%)', dot: '#fbbf24' },
  mi:   { gradient: 'radial-gradient(circle at 30% 20%, #3b82f6 0%, #0f172a 60%)', dot: '#60a5fa' },
  rcb:  { gradient: 'radial-gradient(circle at 30% 20%, #ef4444 0%, #1a0a0a 60%)', dot: '#f87171' },
  kkr:  { gradient: 'radial-gradient(circle at 30% 20%, #7c3aed 0%, #0f0a1e 60%)', dot: '#a78bfa' },
  dc:   { gradient: 'radial-gradient(circle at 30% 20%, #2563eb 0%, #0c1b3a 60%)', dot: '#60a5fa' },
  gt:   { gradient: 'radial-gradient(circle at 30% 20%, #06b6d4 0%, #042f2e 60%)', dot: '#22d3ee' },
  rr:   { gradient: 'radial-gradient(circle at 30% 20%, #ec4899 0%, #1d0520 60%)', dot: '#f472b6' },
  srh:  { gradient: 'radial-gradient(circle at 30% 20%, #f97316 0%, #1c0d00 60%)', dot: '#fb923c' },
  pbks: { gradient: 'radial-gradient(circle at 30% 20%, #e11d48 0%, #200c14 60%)', dot: '#fb7185' },
};

const getTeamImage = (id) => {
  const n = (id || '').toLowerCase();
  switch (n) {
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

const SquadPage = ({ team, onBack }) => {
  const [squadMembers, setSquadMembers] = useState([]);
  const [liveStats, setLiveStats] = useState({});
  const [loading, setLoading] = useState(true);
  const teamId = (team.id || '').toLowerCase();
  const theme = teamThemes[teamId] || { gradient: 'radial-gradient(circle at 30% 20%, #4f46e5 0%, #0f0f1e 60%)', dot: '#818cf8' };
  const teamImg = getTeamImage(team.id);

  useEffect(() => {
    const unsubscribePlayers = onSnapshot(collection(db, 'teams', team.id, 'roster'), (snapshot) => {
      setSquadMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
  }, [team.id]);

  return (
    <div className="squad-page">
      <button className="squad-back-btn" onClick={onBack}>← BACK TO ALL TEAMS</button>

      {loading ? (
        <div className="squad-loading">
          <div className="squad-spinner"></div>
          <p>LOADING SQUAD...</p>
        </div>
      ) : (
        <>
          <div className="squad-hero" style={{ '--squad-gradient': theme.gradient, '--squad-dot': theme.dot }}>
            <div className="squad-hero-bg" />
            <div className="squad-hero-dot" />
            <div className="squad-hero-content">
              <div className="squad-hero-avatar">
                {teamImg
                  ? <img src={teamImg} alt={team.name} className="squad-hero-logo" />
                  : <span className="squad-hero-abbr">{(team.name||'T').substring(0,3).toUpperCase()}</span>
                }
              </div>
              <div className="squad-hero-text">
                <h1 className="squad-hero-name">{(team.name || '').toUpperCase()}</h1>
                <div className="squad-hero-tags">
                  <span className="squad-hero-tag">{squadMembers.length} Players</span>
                  <span className="squad-hero-tag">IPL Franchise</span>
                </div>
              </div>
            </div>
          </div>

          <div className="squad-grid">
            {squadMembers.length > 0 ? (
              squadMembers.map((member, index) => {
                const pg = theme.gradient;
                const pd = theme.dot;
                const stats = liveStats[member.id] || liveStats[(member.name || '').trim().toLowerCase()] || { matches: member.matches || 0, points: member.points || member.runs || 0 };
                
                return (
                  <div
                    key={member.id}
                    className="squad-player-card"
                    style={{ '--pg': pg, '--pd': pd, animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="spc-bg" />
                    <div className="spc-dot" />
                    <div className="spc-number">#{index + 1}</div>
                    <div className="spc-avatar">
                      <span>{(member.name || '?').split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase()}</span>
                    </div>
                    <div className="spc-info">
                      <h3 className="spc-name">{member.name}</h3>
                      <p className="spc-role">{(member.role || 'Player').toUpperCase()}</p>
                    </div>
                    <div className="spc-tags">
                      <span className="spc-tag">🏏 {stats.matches} Matches</span>
                      <span className="spc-tag">⚡ {stats.points} Points</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="squad-empty">
                <p>NO PLAYERS IN THIS SQUAD</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SquadPage;
