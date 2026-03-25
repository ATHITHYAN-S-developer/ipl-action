import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';
import Navigation from '../Navigation/Navigation';
import { db } from '../../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import TeamsGrid from './TeamsGrid';
import AuctionDashboard from '../AuctionDashboard/AuctionDashboard';
import PlayersPage from '../PlayersPage/PlayersPage';
import Scoreboard from '../Scoreboard/Scoreboard';
import SquadPage from '../SquadPage/SquadPage';
import Feedback from '../Feedback/Feedback';

// Images for marquee


import img1 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 4.24.23 PM (1).jpeg';
import img2 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 4.24.23 PM (2).jpeg';
import img3 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 4.24.23 PM.jpeg';
import img4 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 4.24.24 PM.jpeg';
import img5 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 4.25.32 PM.jpeg';
import img6 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 9.02.37 PM.jpeg';
import img7 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 9.02.35 PM.jpeg';
import img8 from '../../assets/image in home page/WhatsApp Image 2026-03-24 at 9.02.35 PM (1).jpeg';

const marqueeImages = [img1, img2, img3, img4, img5, img6, img7, img8];

const HomePage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matchInfo, setMatchInfo] = useState({ nextMatchTime: '9:00 AM', footerStatus: 'PORTAL ACTIVE' });
  const [liveScore, setLiveScore] = useState({ teamA: '', teamB: '', scoreA: '', scoreB: '', overs: '' });
  const [displayTime, setDisplayTime] = useState('00:00');
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const heroRef = useRef(null);



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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      if (heroRef.current) {
        const hRect = heroRef.current.getBoundingClientRect();
        const centerX = hRect.left + hRect.width / 2;
        const centerY = hRect.top + hRect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        
        // Intensity of tilt
        const tiltX = (dy / hRect.height) * -15; // Vertical mouse move tilts on X axis
        const tiltY = (dx / hRect.width) * 15;   // Horizontal mouse move tilts on Y axis
        setHeroTilt({ x: tiltX, y: tiltY });
      }
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
            <div 
              className="home-hero-premium-wrap" 
              ref={heroRef}
              style={{
                perspective: '1000px'
              }}
            >
              <div 
                className="home-hero-premium hero-3d-card"
                style={{
                  transform: `rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg)`,
                  transition: 'transform 0.1s ease'
                }}
              >
                <div className="hero-overlay-dynamic" style={{
                  background: `radial-gradient(circle at ${mousePos.x % 100}% ${mousePos.y % 100}%, rgba(0, 255, 255, 0.15), transparent 50%)`
                }}></div>
                <div className="hero-content-glass">
                  <div className="hero-badge glitch-text" data-text="OFFICIAL LEAGUE PORTAL">OFFICIAL LEAGUE PORTAL</div>
                  <h1 className="hero-title-premium scale-in">
                    CHAMP INTER DISTRICT<br />
                    <span className="accent-gold pulse-gold">LEADERSHIP PREMIUM LEAGUE</span>
                  </h1>
                  <p className="hero-subtitle-premium">PREMIUM CRICKET EXPERIENCE • ELITE COMPETITION</p>
                    <div className="hero-cta-glass">
                      <button className="btn-glass primary" onClick={() => handleTabChange('teams')}>EXPLORE TEAMS</button>
                      <button className="btn-glass secondary" onClick={() => handleTabChange('scoreboard')}>VIEW LIVE STATS</button>
                    </div>
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
              <div className="fade-up" style={{ animationDelay: '0.2s' }}>
                <MetricCard label="TOTAL TEAMS" value={teams.length} icon="👥" mousePos={mousePos} />
              </div>
              <div className="fade-up" style={{ animationDelay: '0.4s' }}>
                <MetricCard label="MATCH" value={displayTime} icon="🏏" mousePos={mousePos} />
              </div>
              <div className="fade-up" style={{ animationDelay: '0.6s' }}>
                <MetricCard label="NEXT LIVE" value={matchInfo.nextMatchTime} unit="HRS" icon="⏰" mousePos={mousePos} />
              </div>
            </div>

            {/* IMAGE MARQUEE SECTION */}
            <div className="home-marquee-section fade-up" style={{ animationDelay: '0.7s' }}>
              <div className="section-label-elite" style={{ textAlign: 'center', marginBottom: '2rem' }}>LEADERSHIP SPOTLIGHT</div>
              <div className="marquee-track">
                {[...marqueeImages, ...marqueeImages].map((img, i) => (
                  <div key={i} className="marquee-item">
                    <img src={img} alt={`Gallery ${i}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="home-features-grid">
              <div className="fade-up" style={{ animationDelay: '0.8s' }}>
                <InteractiveCard title="Rotaract District 3203 " desk="Rotaract District 3203 is a vibrant community of passionate young rotaractors dedicated to service, creativity, and impact. Guided by Rotary International, the district thrives under the theme Rotaract Mania, promoting unity, innovation, and leadership.

With the powerful call “Lead for Change” Rotaractors are inspired to step up, take initiative, and create meaningful transformation in their communities. Here, leadership is not just a role — it’s a responsibility to drive change and build a better future." mousePos={mousePos} />
              </div>
              <div className="fade-up" style={{ animationDelay: '1.0s' }}>
                <InteractiveCard title="CHAMP " desk="CHAMP – Leadership Premier League is a 7-day online leadership program inspired by the energy and format of an IPL-style cricket league. Participants become players, form teams, and engage in daily leadership challenges that build skills like communication, teamwork, decision making, and innovation. With a mix of competition, collaboration, and real-time tasks, CHAMP transforms learning into an exciting league where individuals grow, teams perform, and leaders emerge as champions. 🏏" mousePos={mousePos} />
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
        {activeTab === 'auction' && <AuctionDashboard user={user} />}
        {activeTab === 'feedback' && <Feedback />}
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
