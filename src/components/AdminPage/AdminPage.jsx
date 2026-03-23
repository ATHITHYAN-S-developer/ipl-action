import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import './AdminPage.css';

const AdminPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({ teamA: '', teamB: '', scoreA: '', scoreB: '', overs: '' });
  const [matchInfo, setMatchInfo] = useState({ nextMatchTime: '02:00', remainingDays: '45', footerStatus: 'PORTAL ACTIVE' });

  // Form States
  const [newPlayer, setNewPlayer] = useState({ name: '', role: 'Batsman', team: '', matches: 0, runs: 0, wickets: 0, average: 0 });
  const [newTeam, setNewTeam] = useState({ name: '', icon: '🏏', id: '', budget: 80, spent: 0 });

  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubScores = onSnapshot(doc(db, 'settings', 'liveScore'), (snapshot) => {
      if (snapshot.exists()) setScores(snapshot.data());
    });

    const unsubMatch = onSnapshot(doc(db, 'settings', 'matchInfo'), (snapshot) => {
      if (snapshot.exists()) setMatchInfo(snapshot.data());
    });

    return () => {
      unsubPlayers();
      unsubTeams();
      unsubScores();
      unsubMatch();
    };
  }, []);

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'players'), newPlayer);
      setNewPlayer({ name: '', role: 'Batsman', team: '', matches: 0, runs: 0, wickets: 0, average: 0 });
      alert('Player Created!');
    } catch (err) { console.error(err); }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const teamId = newTeam.id.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'teams', teamId), { ...newTeam, id: teamId });
      setNewTeam({ name: '', icon: '🏏', id: '', budget: 80, spent: 0 });
      alert('Team Created!');
    } catch (err) { console.error(err); }
  };

  const handleUpdatePlayer = async (id, field, value) => {
    try {
      await updateDoc(doc(db, 'players', id), { [field]: value });
    } catch (err) { console.error(err); }
  };

  const handleDeletePlayer = async (id) => {
    if (window.confirm('Delete player?')) await deleteDoc(doc(db, 'players', id));
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try { await setDoc(doc(db, 'settings', 'liveScore'), scores); alert('Scores Updated!'); }
    catch (err) { console.error(err); }
  };

  const handleUpdateMatchInfo = async (e) => {
    e.preventDefault();
    try { await setDoc(doc(db, 'settings', 'matchInfo'), matchInfo); alert('Match Info Updated!'); }
    catch (err) { console.error(err); }
  };

  const handleInitDB = async () => {
    if (!window.confirm('Initialize DB?')) return;
    try {
      await setDoc(doc(db, 'settings', 'matchInfo'), { nextMatchTime: '02:00', remainingDays: '45', footerStatus: 'SYSTEM ONLINE' });
      alert('DB Initialized!');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="admin-container premium-glass-theme">
      <div className="admin-sidebar">
        <h2 className="admin-logo">ELITE ADMIN</h2>
        <nav>
          <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>PLAYERS</button>
          <button className={activeTab === 'teams' ? 'active' : ''} onClick={() => setActiveTab('teams')}>TEAMS</button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>SETTINGS</button>
        </nav>
        <button className="logout-btn" onClick={onLogout}>logout</button>
      </div>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab.toUpperCase()} CONTROLS</h1>
        </header>

        <section className="admin-content">
          {activeTab === 'players' && (
            <div className="admin-grid-two-col">
              <div className="update-form-card glass-card">
                <h3>CREATE PLAYER</h3>
                <form onSubmit={handleCreatePlayer} className="admin-form-vertical">
                  <input placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} required />
                  <select value={newPlayer.team} onChange={e => setNewPlayer({...newPlayer, team: e.target.value})} required>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                  <button type="submit" className="save-btn">ADD PLAYER</button>
                </form>
              </div>
              <div className="update-form-card glass-card">
                <h3>PLAYER LIST</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>NAME</th><th>TEAM</th><th>RUNS</th></tr></thead>
                    <tbody>
                      {players.map(p => (
                        <tr key={p.id}>
                          <td>{p.name}</td><td>{p.team}</td>
                          <td><input type="number" value={p.runs} onChange={e => handleUpdatePlayer(p.id, 'runs', e.target.value)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="admin-grid-two-col">
              <div className="update-form-card glass-card">
                <h3>REGISTER TEAM</h3>
                <form onSubmit={handleCreateTeam} className="admin-form-vertical">
                  <input placeholder="Team Name" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} required />
                  <input placeholder="ID (e.g. csk)" value={newTeam.id} onChange={e => setNewTeam({...newTeam, id: e.target.value})} required />
                  <input type="number" placeholder="Budget (Cr)" value={newTeam.budget} onChange={e => setNewTeam({...newTeam, budget: Number(e.target.value)})} />
                  <button type="submit" className="save-btn">CREATE TEAM</button>
                </form>
              </div>
              <div className="update-form-card glass-card">
                <h3>TEAMS IN DB</h3>
                <div className="teams-list-admin">
                  {teams.map(t => (
                    <div key={t.id} className="team-item-admin">
                      <span>{t.icon} {t.name}</span>
                      <span style={{ color: '#fccf14' }}>₹{t.spent} / {t.budget} Cr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-grid-two-col">
              <div className="update-form-card glass-card">
                <h3>MATCH SCHEDULING</h3>
                <form onSubmit={handleUpdateMatchInfo} className="admin-form-vertical">
                  <div className="input-group">
                    <label>Next Match (Time/Text)</label>
                    <input value={matchInfo.nextMatchTime} onChange={e => setMatchInfo({...matchInfo, nextMatchTime: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Remaining Days</label>
                    <input value={matchInfo.remainingDays} onChange={e => setMatchInfo({...matchInfo, remainingDays: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Footer Status Msg</label>
                    <input value={matchInfo.footerStatus} onChange={e => setMatchInfo({...matchInfo, footerStatus: e.target.value})} />
                  </div>
                  <button type="submit" className="save-btn">SYNC SCHEDULER</button>
                </form>
              </div>

              <div className="update-form-card glass-card">
                <h3>LIVE SCOREBOARD</h3>
                <form onSubmit={handleUpdateScore} className="admin-form-vertical">
                  <input value={scores.teamA} onChange={e => setScores({...scores, teamA: e.target.value})} placeholder="Team A" />
                  <input value={scores.scoreA} onChange={e => setScores({...scores, scoreA: e.target.value})} placeholder="Score A" />
                  <input value={scores.teamB} onChange={e => setScores({...scores, teamB: e.target.value})} placeholder="Team B" />
                  <input value={scores.scoreB} onChange={e => setScores({...scores, scoreB: e.target.value})} placeholder="Score B" />
                  <input value={scores.overs} onChange={e => setScores({...scores, overs: e.target.value})} placeholder="Overs" />
                  <button type="submit" className="save-btn">UPDATE SCORES</button>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
