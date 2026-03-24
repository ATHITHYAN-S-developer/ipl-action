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
    if (window.confirm('Delete this player?')) {
      try {
        await deleteDoc(doc(db, 'players', id));
        alert('Player deleted successfully!');
      } catch (e) {
        console.error(e);
        alert('Error deleting player: ' + e.message);
      }
    }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('Delete this team?')) {
      try {
        await deleteDoc(doc(db, 'teams', id));
        alert('Team deleted successfully!');
      } catch (e) {
        console.error(e);
        alert('Error deleting team: ' + e.message);
      }
    }
  };

  const bulkLoadAllTeams = async () => {
    const data = {
      kkr: ["AKSHAYA S", "Pranav Harsan A E", "Rtr.Kanishka.K", "Rtr Vidhyavarshini", "S.SARANRAJ", "SUBIKSHA.S", "PRADHAKSHNA.K", "P U Harshitha", "Rtr.KANISHKA T", "Prince B", "Akshaya"],
      rcb: ["Jeevananth K", "LIBIKA SV", "Rtr. Nisha Sesadri T", "BRINDHA T", "S.Karthikeyan", "Rtr nishanth rao g", "Raveena Ragavi S", "Devi shree S", "Jagatheeswaran.S", "Sangavi.M.P", "Rajasuhas"],
      rr: ["Rtr.Janadharshini S", "SRI VISHNU SANTH B", "JOCHIHAL CHELIAN", "Praveen KU", "S.Masila Puvisha", "Avanthikaa G K", "Sangeetha Ganesan", "Shanmitha K", "S.RAMYA", "ZRR. Rtr. PP. Vaishnavi Kumari", "Jaysree"],
      dc: ["Rtr.PP.Tamilpriya Thangaraju", "Rtr. Vansh Saini", "HARIPRIYA C", "Sakthi Ganesh S", "KOWSALYADEVI D", "SUDHARSAN RAAJHAN V S", "Poonguzhali Loganathan", "Theshmika S", "GOKUL.S", "MADHULIKA R", "Karthikeyan"],
      gt: ["Rtr jeeva.s", "Rtr. Sureka P", "Rtr. Mahenoor Khan", "Sadhana", "Sree Mati M M", "N. GOBIKA", "Rtr Amritha P", "Rtr.preethi G", "Rtr.BANU K G", "Vanitha S", "Farhana"],
      mi: ["Rtr.Janani K", "NALINI AMIRTHAVEL", "Vikhashini C", "NIKITHA V", "Abinaya M", "Sujai S P", "Jerom.r", "Rtr.Abdulrashed", "SRI DHARSHINI.V", "SUJITHA R", "Serena Sam"]
    };

    try {
      for (const [id, plist] of Object.entries(data)) {
        // Create Team
        await setDoc(doc(db, 'teams', id), {
          id: id,
          name: id.toUpperCase(),
          budget: 80,
          spent: 0,
          icon: '🏏'
        });

        // Add Players
        for (const name of plist) {
          await addDoc(collection(db, 'players'), {
            name,
            team: id,
            runs: 0,
            wickets: 0
          });
        }
      }
      alert('All Teams (GT, MI, KKR, RCB, RR, DC) and their players added successfully!');
    } catch (e) {
      console.error(e);
      alert('Error in bulk loading data');
    }
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
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
                <div className="admin-list-card">
                  <h3>EXISTING TEAMS</h3>
                  <button onClick={bulkLoadAllTeams} className="btn-secondary" style={{ marginBottom: '15px', width: '100%', fontSize: '0.7rem' }}>
                    ⚡ BULK LOAD ALL TEAMS (GT, MI, KKR, RCB, RR, DC)
                  </button>
                  <div className="admin-items-list">
                    {teams.map(t => (
                      <div key={t.id} className="team-item-admin">
                        <div className="item-info">
                          <span className="item-name">{t.icon} {t.name}</span>
                          <span className="item-meta">₹{t.spent} / {t.budget} Cr</span>
                        </div>
                        <button onClick={() => handleDeleteTeam(t.id)} className="btn-delete-small">🗑️</button>
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
                    <label>Next Match Time (e.g. 9:00 AM)</label>
                    <input value={matchInfo.nextMatchTime} onChange={e => setMatchInfo({...matchInfo, nextMatchTime: e.target.value})} placeholder="9:00 AM" />
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
