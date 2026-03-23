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
  const [matchInfo, setMatchInfo] = useState({ nextMatchTime: '9:00 AM', footerStatus: 'PORTAL ACTIVE' });
  const [liveScore, setLiveScore] = useState({ teamA: '', teamB: '', scoreA: '', scoreB: '', overs: '' });
  const [displayTime, setDisplayTime] = useState('00:00');
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubMatch = onSnapshot(doc(db, 'settings', 'matchInfo'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setMatchInfo(data);
        setDisplayTime(data.nextMatchTime);
      }
    });

    const unsubScore = onSnapshot(doc(db, 'settings', 'liveScore'), (snapshot) => {
      if (snapshot.exists()) setLiveScore(snapshot.data());
    });

    return () => {
      unsubTeams();
      unsubMatch();
      unsubScore();
    };
  }, []);

  // --- Real-time Countdown Timer (Support for AM/PM Target Time) ---
  useEffect(() => {
    const parseTargetTime = (timeStr) => {
      if (!timeStr) return null;
      try {
        const parts = timeStr.trim().split(/\s+/);
        if (parts.length < 2) return null; // Needs time and AM/PM
        
        let [time, period] = parts;
        let [hours, minutes] = time.split(':').map(Number);
        period = period.toUpperCase();
        
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const target = new Date();
        target.setHours(hours, minutes || 0, 0, 0);
        
        // If the target has already passed today, assume it's for tomorrow
        if (target < new Date()) {
          target.setDate(target.getDate() + 1);
        }
        return target;
      } catch (e) {
        return null;
      }
    };

    const timer = setInterval(() => {
      const targetDate = parseTargetTime(matchInfo.nextMatchTime);
      if (!targetDate) {
        setDisplayTime(matchInfo.nextMatchTime);
        return;
      }

      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setDisplayTime("00:00:00");
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      const timeStr = [
        h.toString().padStart(2, '0'),
        m.toString().padStart(2, '0'),
        s.toString().padStart(2, '0')
      ].join(':');

      setDisplayTime(timeStr);
    }, 1000);

    return () => clearInterval(timer);
  }, [matchInfo.nextMatchTime]);

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

            {/* LIVE SCOREBOARD BANNER */}
            {liveScore.teamA && (
              <div className="live-score-banner-glass pulse-border">
                <div className="live-badge-premium">LIVE MATCH</div>
                <div className="score-main-flex">
                  <div className="score-team">
                    <span className="team-name-lg">{liveScore.teamA}</span>
                    <span className="team-score-num">{liveScore.scoreA}</span>
                  </div>
                  <div className="score-vs-premium">VS</div>
                  <div className="score-team">
                    <span className="team-score-num">{liveScore.scoreB}</span>
                    <span className="team-name-lg">{liveScore.teamB}</span>
                  </div>
                </div>
                {liveScore.overs && <div className="score-overs">{liveScore.overs} OVERS</div>}
              </div>
            )}

            <div className="metrics-grid-proper three-cols">
              <MetricCard label="TOTAL TEAMS" value={teams.length} icon="👥" mousePos={mousePos} />
              <MetricCard label="MATCH" value={displayTime} icon="🏏" mousePos={mousePos} />
              <MetricCard label="NEXT LIVE" value={matchInfo.nextMatchTime} unit="HRS" icon="⏰" mousePos={mousePos} />
            </div>

            <div className="home-features-grid">
              <InteractiveCard title="Team Auctions" desk="Watch as teams build their squads with strategic bidding. Follow the action in real-time and see which players command the highest prices." mousePos={mousePos} />
              <InteractiveCard title="Live Matches" desk="Experience cricket like never before. Track live scores, player statistics, and match highlights all in one place." mousePos={mousePos} />
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

export default HomePage;
