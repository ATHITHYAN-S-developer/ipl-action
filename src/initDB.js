import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

async function initDB() {
  try {
    // 1. Create Users
    const users = [
      { id: 'admin-1', username: 'superchamp3203', password: 'superchamp32033203', role: 'admin', team: 'ADMIN' },
      { id: 'user-1', username: 'champ3203', password: 'champ32033203', role: 'user', team: 'GENERIC' }
    ];

    for (const user of users) {
      await setDoc(doc(db, 'users', user.id), user);
    }

    // 2. Create Initial Auction Status
    await setDoc(doc(db, 'auction', 'status'), {
      currentPlayer: {
        name: 'Ravindra Jadeja',
        role: 'All-rounder',
        basePrice: '₹ 0.20 Cr'
      },
      currentBid: 1.55,
      leadingTeam: 'Chennai Super Kings',
      isLive: true,
      lastBidAt: new Date().toISOString()
    });

    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDB();
