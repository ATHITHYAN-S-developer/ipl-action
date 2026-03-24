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

      <div className="auction-main-grid" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="auction-card-main glass-card highlight-glow" style={{ textAlign: 'center', padding: '80px 40px', width: '100%', maxWidth: '800px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fccf14', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: '1.6' }}>
            Action completed<br/>on 23 . 03 . 2026<br/>completed
          </h2>
        </div>
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
