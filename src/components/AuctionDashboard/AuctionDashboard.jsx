import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, updateDoc, collection, query, limit, getDocs, where } from 'firebase/firestore';
import './AuctionDashboard.css';

const AuctionDashboard = ({ user }) => {
  const [auctionStatus, setAuctionStatus] = useState(null);
  const [upcomingPlayers, setUpcomingPlayers] = useState([]);
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

    fetchUpcoming();
    return () => unsubStatus();
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

      <div className="auction-main-grid">
        <div className="auction-card-main glass-card highlight-glow">
          <div className="auction-card-header">
            <div className="player-meta">
              <span className="player-category-tag">{status.currentPlayer?.role?.toUpperCase() || 'PLAYER'}</span>
              <h2 className="player-active-name">{status.currentPlayer?.name || 'Waiting...'}</h2>
            </div>
            <div className="bid-stats-mini">
              <span className="base-price-tag">BASE: {status.currentPlayer?.basePrice || '₹ 0.20 Cr'}</span>
            </div>
          </div>

          <div className="bidding-display-sector">
            <div className="current-bid-container">
              <label>CURRENT HIGHEST BID</label>
              <div className="bid-amount-large">
                <span className="currency">₹</span>
                <span className="amount-val">{Number(status.currentBid || 0).toFixed(2)}</span>
                <span className="unit">CR</span>
              </div>
            </div>
            
            <div className="leading-team-container">
              <label>LEADING CONTENDER</label>
              <div className="team-banner-glow">
                {(status.leadingTeam || 'NONE').toUpperCase()}
              </div>
            </div>
          </div>

          <div className="bidding-actions-sector">
            <div className="bid-controls-grid">
              <button className="bid-btn btn-50l" onClick={() => handleBid(0.5)}>+ ₹50 L</button>
              <button className="bid-btn btn-1cr" onClick={() => handleBid(1.0)}>+ ₹1 CR</button>
              <button className="bid-btn btn-2cr" onClick={() => handleBid(2.0)}>+ ₹2 CR</button>
              <button className="bid-btn btn-5cr" onClick={() => handleBid(5.0)}>+ ₹5 CR</button>
            </div>
            <button className="place-custom-bid-btn">PLACE STRATEGIC BID</button>
          </div>
        </div>

        <div className="auction-sidebar-lists">
          <div className="sidebar-card glass-card">
            <h3>UPCOMING TALENT</h3>
            <div className="mini-player-list">
              {upcomingPlayers.map(p => (
                <div key={p.id} className="mini-player-item">
                  <div className="p-info">
                    <span className="p-name">{p.name}</span>
                    <span className="p-role">{p.role}</span>
                  </div>
                  <span className="p-price">{p.basePrice || '₹ 0.20 Cr'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="auction-ticker-wrap">
        <div className="auction-ticker">
          <span>REAL-TIME BIDDING SYNCED WITH CLOUD</span>
          <span className="ticker-sep">•</span>
          <span>ELITE CRICKET AUCTION PORTAL</span>
          <span className="ticker-sep">•</span>
          <span>CHAMP LEAGUE SEASON 2026</span>
        </div>
      </div>
    </div>
  );
};

export default AuctionDashboard;
