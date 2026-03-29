import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, updateDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import './AuctionDashboard.css';

const AuctionDashboard = ({ user }) => {
  const [auctionStatus, setAuctionStatus] = useState(null);
  const [upcomingPlayers, setUpcomingPlayers] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, 'auction', 'status'), (snapshot) => {
      if (snapshot.exists()) setAuctionStatus(snapshot.data());
      setLoading(false);
    });

    const fetchUpcoming = async () => {
      const q = query(collection(db, 'players'), limit(5));
      const snap = await getDocs(q);
      setUpcomingPlayers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const unsubMatches = onSnapshot(collection(db, 'completedMatches'), (snapshot) => {
      setCompletedMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });

    fetchUpcoming();
    return () => { unsubStatus(); unsubMatches(); };
  }, []);

  const handleBid = async (incAmount) => {
    if (!auctionStatus || !auctionStatus.isLive) return;

    try {
      const auctionRef = doc(db, 'auction', 'status');
      const newBid = (auctionStatus.currentBid || 0) + incAmount;
      const teamName = user?.team || user?.username || 'Anonymous Team';
      
      // Update Auction Status
      await updateDoc(auctionRef, {
        currentBid: newBid,
        leadingTeam: teamName,
        lastBidAt: new Date().toISOString()
      });

      // Update Team's "spent" amount in real-time (optional: user requested spent to show in points table)
      // Note: This logic assumes 'spent' is currently being tracked per bid.
      // Usually, 'spent' is updated on SOLD, but user wants to see "betting amount" in points table.
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where('name', '==', teamName));
      const teamSnap = await getDocs(q);
      if (!teamSnap.empty) {
        const teamDoc = teamSnap.docs[0];
        await updateDoc(doc(db, 'teams', teamDoc.id), {
          spent: newBid // Updating with current bid for visibility in Points Table
        });
      }

    } catch (err) {
      console.error('Bidding error:', err);
    }
  };

  if (loading) return <div className="auction-loading">INITIALIZING LIVE FEED...</div>;

  const status = auctionStatus || {
    currentPlayer: { name: 'Waiting...', role: '-', basePrice: '₹ 0.00' },
    currentBid: 0,
    leadingTeam: 'None',
    isLive: false
  };

  return (
    <div className="auction-outer-wrapper premium-glass-theme">
      <div className="auction-hero-section">
        <div className="auction-hero-content">
          <div className="live-tag pulse">LIVE AUCTION</div>
          <h1 className="auction-main-title">BIDDING ARENA</h1>
          <p className="auction-tagline">REAL-TIME PLAYER ACQUISITION PORTAL</p>
        </div>
      </div>

      <div className="auction-main-grid" style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
        <div className="auction-card-main glass-card highlight-glow" style={{ textAlign: 'center', padding: '80px 40px', width: '100%', maxWidth: '800px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fccf14', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: '1.6' }}>
            Action completed<br/>on 23 . 03 . 2026<br/>completed
          </h2>
        </div>

        {/* --- COMPLETED MATCHES SECTION --- */}
        {completedMatches.length > 0 && (
          <div className="completed-matches-feed" style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: '#00ffff', letterSpacing: '3px', textAlign: 'center', marginBottom: '10px' }}>
              COMPLETED STAGES
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {completedMatches.map(m => (
                <div key={m.id} className="match-result-card glass-card pulse" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(252, 207, 20, 0.3)', backdropFilter: 'blur(10px)', boxShadow: '0 0 15px rgba(252, 207, 20, 0.1)', gap: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#9a9bbf', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    DATE • {m.date || 'TBA'}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontFamily: 'Orbitron', fontWeight: 800, color: '#fccf14', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center', textShadow: '0 0 10px rgba(252, 207, 20, 0.5)' }}>
                    {m.matchName}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: '#00ffff', textShadow: '0 0 5px rgba(0, 255, 255, 0.4)', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(0, 255, 255, 0.2)', padding: '5px 15px', borderRadius: '20px', marginTop: '5px' }}>
                    🏆 WINNER: {m.winner || 'PENDING'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="auction-ticker-wrap">
        <div className="auction-ticker">
          <span>REAL-TIME BIDDING SYNCED WITH CLOUD</span>
          <span className="ticker-sep">•</span>
          <span>ELITE CRICKET AUCTION PORTAL</span>
          <span className="ticker-sep">•</span>
          <span>CHAMP LEAGUE SEASON 2026</span>
           <span>Champ Inter District E - Ryla</span>
        </div>
      </div>
    </div>
  );
};

export default AuctionDashboard;
