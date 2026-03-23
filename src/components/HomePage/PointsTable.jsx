import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import './PointsTable.css';

const PointsTable = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'teams'), orderBy('spent', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="pts-loading">GATHERING LEAGUE DATA...</div>;

  return (
    <section className="points-table-section">
      <div className="table-container-wrapper">
        <div className="table-container glass">
          <table className="pts-table">
            <thead>
              <tr>
                <th>POS</th>
                <th style={{ textAlign: 'left' }}>TEAM</th>
                <th>BUDGET</th>
                <th>SPENT</th>
                <th>REMAINING</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={team.id} className="pts-row">
                  <td className="pos-cell">{index + 1}</td>
                  <td className="team-cell">
                    <span className="team-icon-circle">{team.icon || '🏏'}</span>
                    <span className="team-name-text">{team.name}</span>
                  </td>
                  <td>₹{team.budget || 80} Cr</td>
                  <td><span className="val-w">₹{team.spent || 0} Cr</span></td>
                  <td><span className="val-l">₹{(team.budget || 80) - (team.spent || 0)} Cr</span></td>
                  <td>
                    <span className="pts-badge">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pts-summary-cards">
        <div className="pts-summary-card">
          <div className="summary-icon yellow">💰</div>
          <div className="summary-info">
            <h3 className="summary-val">₹{teams.reduce((acc, t) => acc + (t.spent || 0), 0).toFixed(1)} Cr</h3>
            <p className="summary-label">TOTAL LEAGUE SPEND</p>
          </div>
        </div>
        <div className="pts-summary-card">
          <div className="summary-icon green">🛡️</div>
          <div className="summary-info">
            <h3 className="summary-val">{teams.length}</h3>
            <p className="summary-label">REGISTERED TEAMS</p>
          </div>
        </div>
        <div className="pts-summary-card">
          <div className="summary-icon blue">⚡</div>
          <div className="summary-info">
            <h3 className="summary-val">ACTIVE</h3>
            <p className="summary-label">AUCTION STATUS</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PointsTable;
