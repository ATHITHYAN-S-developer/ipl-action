import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';
import Navigation from '../Navigation/Navigation';
import { db } from '../../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import PointsTable from './PointsTable';
import TeamsGrid from './TeamsGrid';
import AuctionDashboard from '../AuctionDashboard/AuctionDashboard';
import PlayersPage from '../PlayersPage/PlayersPage';
import Scoreboard from '../Scoreboard/Scoreboard';
import SquadPage from '../SquadPage/SquadPage';

const HomePage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matchInfo, setMatchInfo] = useState({ nextMatchTime: '02:00', remainingDays: '45', footerStatus: 'PORTAL ACTIVE' });
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubMatch = onSnapshot(doc(db, 'settings', 'matchInfo'), (snapshot) => {
      if (snapshot.exists()) setMatchInfo(snapshot.data());
    });

    return () => {
      unsubTeams();
      unsubMatch();
    };
  }, []);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedTeam(null);
  };

  const upcomingMatches = [
    { date: 'Mar 18, 2026', time: '7:30 PM', team1: 'Mumbai Warriors', team2: 'Chennai Super Kings' },
    { date: 'Mar 19, 2026', time: '3:30 PM', team1: 'Royal Challengers', team2: 'Delhi Capitals' },
    { date: 'Mar 19, 2026', time: '7:30 PM', team1: 'Kolkata Knights', team2: 'Punjab Kings' }
  ];

  return (
    <div className="home-container" ref={containerRef} onMouseMove={handleMouseMove}>
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />

      <main className="home-main">
        {activeTab === 'home' && (
          <div className="home-dashboard premium-glass-theme">
            <div className="home-hero-premium floating-anim">
              <div className="hero-overlay"></div>
              <div className="hero-content-glass">
                <div className="hero-badge glitch-text" data-text="OFFICIAL LEAGUE PORTAL">OFFICIAL LEAGUE PORTAL</div>
                <h1 className="hero-title-premium scale-in">
                  CHAMP INTER DISTRICT E - RYLA<br />
                  <span className="accent-gold pulse-gold">LEADERSHIP PREMIUM LEAGUE</span>
                </h1>
                <p className="hero-subtitle-premium">PREMIUM CRICKET EXPERIENCE • ELITE COMPETITION</p>
                <div className="hero-cta-glass">
                  <button className="btn-glass primary" onClick={() => handleTabChange('teams')}>EXPLORE TEAMS</button>
                  <button className="btn-glass secondary" onClick={() => handleTabChange('scoreboard')}>VIEW LIVE STATS</button>
                </div>
              </div>
            </div>

            <div className="metrics-grid-proper">
              <MetricCard label="TOTAL TEAMS" value={teams.length} icon="👥" mousePos={mousePos} />
              <MetricCard label="MATCHES" value="06" icon="🏏" mousePos={mousePos} />
              <MetricCard label="REMAINING DAYS" value={matchInfo.remainingDays} icon="📅" mousePos={mousePos} />
              <MetricCard label="NEXT LIVE" value={matchInfo.nextMatchTime} unit="HRS" icon="⏰" mousePos={mousePos} />
            </div>

            <div className="home-features-grid">
              <InteractiveCard title="Team Auctions" desk="Watch as teams build their squads with strategic bidding. Follow the action in real-time and see which players command the highest prices." mousePos={mousePos} />
              <InteractiveCard title="Live Matches" desk="Experience cricket like never before. Track live scores, player statistics, and match highlights all in one place." mousePos={mousePos} />
            </div>

            <div className="upcoming-matches-section">
              <h2 className="section-title">Upcoming Matches</h2>
              <div className="matches-grid-wrapper">
                {upcomingMatches.map((match, i) => (
                  <MatchCardFigma key={i} match={match} mousePos={mousePos} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Sections */}
        {activeTab === 'teams' && (
          selectedTeam ? (
            <SquadPage team={selectedTeam} onBack={() => setSelectedTeam(null)} />
          ) : (
            <TeamsGrid teams={teams} loading={loading} onViewSquad={setSelectedTeam} />
          )
        )}

        {activeTab === 'scoreboard' && <Scoreboard />}
        {activeTab === 'players' && <PlayersPage />}
        {activeTab === 'points' && <PointsTable />}
        {activeTab === 'auction' && <AuctionDashboard user={user} />}
      </main>

      <footer className="footer-glass-premium">
        <div className="footer-status-tag">
          <span className="footer-dot pulse"></span>
          {matchInfo.footerStatus}
        </div>
        <button onClick={onLogout} className="footer-logout-btn">
          EXIT PORTAL
        </button>
      </footer>
    </div>
  );
};

// --- Interactive Components with Mouse Repulsion ---

const MetricCard = ({ label, value, unit, icon, mousePos }) => {
  const cardRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = mousePos.x - (centerX - window.scrollX);
      const dy = mousePos.y - (centerY - window.scrollY);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 200) {
        const force = (200 - dist) / 200;
        setTranslate({ x: (dx / dist) * -15 * force, y: (dy / dist) * -15 * force });
      } else {
        setTranslate({ x: 0, y: 0 });
      }
    }
  }, [mousePos]);

  return (
    <div className="metric-panel-glass" ref={cardRef} style={{ transform: `translate(${translate.x}px, ${translate.y}px)` }}>
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value} {unit && <span className="unit">{unit}</span>}</div>
    </div>
  );
};

const InteractiveCard = ({ title, desk, mousePos }) => {
  const cardRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = mousePos.x - (centerX - window.scrollX);
      const dy = mousePos.y - (centerY - window.scrollY);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 300) {
        const force = (300 - dist) / 300;
        setTranslate({ x: (dx / dist) * -20 * force, y: (dy / dist) * -20 * force });
      } else {
        setTranslate({ x: 0, y: 0 });
      }
    }
  }, [mousePos]);

  return (
    <div className="feature-card-glass" ref={cardRef} style={{ transform: `translate(${translate.x}px, ${translate.y}px)` }}>
      <h3>{title}</h3>
      <p>{desk}</p>
    </div>
  );
};

const MatchCardFigma = ({ match, mousePos, index }) => {
  const cardRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

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
    <div className="match-card-figma" ref={cardRef} style={{ transform: `translate(${translate.x}px, ${translate.y}px)`, animationDelay: `${index * 0.1}s` }}>
      <div className="match-date-time">{match.date} • {match.time}</div>
      <div className="match-vs-main">
        <div className="team-name">{match.team1}</div>
        <div className="vs-badge">VS</div>
        <div className="team-name">{match.team2}</div>
      </div>
    </div>
  );
};

export default HomePage;
