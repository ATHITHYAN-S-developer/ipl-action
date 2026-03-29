import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc, collectionGroup } from 'firebase/firestore';
import './AdminPage.css';

// Default team scorecard structure
const DEFAULT_TEAM_SCORES = [
  { id: 'srh',  name: 'SRH',  totalScore: 0, players: [] },
  { id: 'rr',   name: 'RR',   totalScore: 0, players: [] },
  { id: 'rcb',  name: 'RCB',  totalScore: 0, players: [] },
  { id: 'pbks', name: 'PBKS', totalScore: 0, players: [] },
  { id: 'mi',   name: 'MI',   totalScore: 0, players: [] },
  { id: 'kkr',  name: 'KKR',  totalScore: 0, players: [] },
  { id: 'gt',   name: 'GT',   totalScore: 0, players: [] },
  { id: 'dc',   name: 'DC',   totalScore: 0, players: [] },
  { id: 'csk',  name: 'CSK',  totalScore: 0, players: [] },
];

const AdminPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('teams');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({ teamA: '', teamB: '', scoreA: '', scoreB: '', overs: '' });
  const [matchInfo, setMatchInfo] = useState({ nextMatchTime: '02:00', remainingDays: '45', footerStatus: 'PORTAL ACTIVE' });
  const [scoreboardData, setScoreboardData] = useState(DEFAULT_TEAM_SCORES);
  const [selectedSbTeam, setSelectedSbTeam] = useState('srh');
  const [sbSaveMsg, setSbSaveMsg] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);

  // Form States
  const [newPlayer, setNewPlayer] = useState({ name: '', role: 'Batsman', team: '', matches: 0, points: 0 });
  const [newTeam, setNewTeam] = useState({ name: '', icon: '🏏', id: '', budget: 80, spent: 0 });

  useEffect(() => {
    const unsubPlayers = onSnapshot(collectionGroup(db, 'roster'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Admin Page Player Load Error:", err);
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

    const unsubSb = onSnapshot(doc(db, 'settings', 'teamScores'), (snapshot) => {
      if (snapshot.exists() && snapshot.data().teams) {
        setScoreboardData(snapshot.data().teams);
      }
    });

    const unsubFeedback = onSnapshot(collection(db, 'feedback'), (snapshot) => {
      setFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPlayers();
      unsubTeams();
      unsubScores();
      unsubMatch();
      unsubSb();
      unsubFeedback();
    };
  }, []);

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.team) return alert('Select a team');
    try {
      const playerId = `${newPlayer.team}-${newPlayer.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await setDoc(doc(db, 'teams', newPlayer.team, 'roster', playerId), newPlayer);
      setNewPlayer({ ...newPlayer, name: '', points: 0 });
      alert('Player Added!');
    } catch (err) {
      console.error(err);
      alert('Error adding player');
    }
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
      const player = players.find(p => p.id === id);
      if(player) await updateDoc(doc(db, 'teams', player.team, 'roster', id), { [field]: value });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlayer = async (id) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        const player = players.find(p => p.id === id);
        if(player) await deleteDoc(doc(db, 'teams', player.team, 'roster', id));
        alert('Player Deleted Successfully!');
      } catch (err) {
        console.error(err);
        alert('Error deleting player');
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
      mi: ["Rtr.Janani K", "NALINI AMIRTHAVEL", "Vikhashini C", "NIKITHA V", "Abinaya M", "Sujai S P", "Jerom.r", "Rtr.Abdulrashed", "SRI DHARSHINI.V", "SUJITHA R", "Serena Sam"],
      srh: ["Rtr. Srinithi V", "Rtr Thiruvazhagu K V", "Kamali R", "Balamurugan P", "Rtr.Santhosh", "Rtr Thilagan M", "Abdus Salam D", "VAISHNAVI D", "PIRITHIHA SHRI G", "Nathiya s", "Rtr Videsh D"],
      pbks: ["Rudra ilakkian M.D", "HARIBINDHA.S", "Aswath Juhhail S", "Darshan PT", "Deepak R", "Rtr.PP.Ashwinbalajee MS", "Prasanna Kumar P", "Rtr kishore kumar k", "Reshma R", "Rtr Preethi L", "Kaviyazhini Mahalingam"],
      csk: ["Rtr. Janaki PL", "Darsani M S", "DARUNA.M", "Sakthi Meenakshi S", "Rtr.B.Abhinandan", "N.INISHA", "ABHINITI M", "Thirumagal Mahendran", "Haneethra M M", "Aruneshwar KG", "Haritha"]
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
        for (const rawName of plist) {
          // Format Name: Add "Rtr." if it doesn't exist
          const name = rawName.match(/Rtr/i) ? rawName : `Rtr. ${rawName}`;
          const playerId = `${id}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          await setDoc(doc(db, 'teams', id, 'roster', playerId), {
            name,
            team: id,
            name,
            team: id,
            points: 0,
            matches: 0
          });
        }
      }
      alert('All Teams (GT, MI, KKR, RCB, RR, DC, SRH, PBKS, CSK) and their players added successfully!');
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

  const handleClearScores = async () => {
    if (window.confirm('Clear the live scoreboard? This will hide the banner on the home page.')) {
      const emptyScores = { teamA: '', teamB: '', scoreA: '', scoreB: '', overs: '' };
      try { 
        await setDoc(doc(db, 'settings', 'liveScore'), emptyScores); 
        setScores(emptyScores);
        alert('Scoreboard Cleared!'); 
      }
      catch (err) { console.error(err); }
    }
  };

  const handleRemoveDuplicates = async () => {
    if (window.confirm("Are you sure you want to remove duplicate players?")) {
      try {
        const seen = new Set();
        let deletedCount = 0;
        
        for (const player of players) {
          const key = `${player.team}-${(player.name || '').trim().toLowerCase()}`;
          if (seen.has(key)) {
            await deleteDoc(doc(db, 'teams', player.team, 'roster', player.id));
            deletedCount++;
          } else {
            seen.add(key);
          }
        }
        alert(`Successfully removed ${deletedCount} duplicate players!`);
      } catch (err) {
        console.error(err);
        alert('Error removing duplicates: ' + err.message);
      }
    }
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

  // ── Scoreboard helpers ────────────────────────────────────────────────────
  const activeSbTeam = scoreboardData.find(t => t.id === selectedSbTeam) || scoreboardData[0];

  const updateSbField = (field, value) => {
    setScoreboardData(prev => prev.map(t =>
      t.id === selectedSbTeam ? { ...t, [field]: value } : t
    ));
  };

  const updateSbPlayer = (idx, field, value) => {
    setScoreboardData(prev => prev.map(t => {
      if (t.id !== selectedSbTeam) return t;
      const newPlayers = [...t.players];
      newPlayers[idx] = { ...newPlayers[idx], [field]: value };
      const newTotal = newPlayers.reduce((sum, p) => sum + (Number(p.points || p.runs) || 0), 0);
      return { ...t, players: newPlayers, totalScore: newTotal };
    }));
  };

  const addSbPlayer = () => {
    setScoreboardData(prev => prev.map(t =>
      t.id === selectedSbTeam
        ? { ...t, players: [...t.players, { name: '', runs: 0, matches: 0 }] }
        : t
    ));
  };

  const removeSbPlayer = (idx) => {
    setScoreboardData(prev => prev.map(t => {
      if (t.id !== selectedSbTeam) return t;
      const newPlayers = t.players.filter((_, i) => i !== idx);
      const newTotal = newPlayers.reduce((sum, p) => sum + (Number(p.points || p.runs) || 0), 0);
      return { ...t, players: newPlayers, totalScore: newTotal };
    }));
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm('Delete this feedback?')) {
      try { await deleteDoc(doc(db, 'feedback', id)); }
      catch (err) { console.error(err); }
    }
  };

  const handleUpdateFeedback = async (id, newText) => {
    try {
      await updateDoc(doc(db, 'feedback', id), { comment: newText });
      setEditingFeedback(null);
    } catch (err) { console.error(err); }
  };

  const handleSaveScoreboard = async () => {
    try {
      await setDoc(doc(db, 'settings', 'teamScores'), { teams: scoreboardData });
      setSbSaveMsg('✅ Saved!');
      setTimeout(() => setSbSaveMsg(''), 2500);
    } catch (err) {
      console.error(err);
      setSbSaveMsg('❌ Error saving');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if ((a.team || '') < (b.team || '')) return -1;
    if ((a.team || '') > (b.team || '')) return 1;
    if ((a.name || '') < (b.name || '')) return -1;
    if ((a.name || '') > (b.name || '')) return 1;
    return 0;
  });

  return (
    <div className="admin-container premium-glass-theme">
      <div className="admin-sidebar">
        <h2 className="admin-logo">ELITE ADMIN</h2>
        <nav>
          <button className={activeTab === 'teams' ? 'active' : ''} onClick={() => setActiveTab('teams')}>TEAMS</button>
          <button className={activeTab === 'scoreboard' ? 'active' : ''} onClick={() => setActiveTab('scoreboard')}>SCOREBOARD</button>
          <button className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}>FEEDBACK</button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>SETTINGS</button>
        </nav>
        <button className="logout-btn" onClick={onLogout}>logout</button>
      </div>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab.toUpperCase()} CONTROLS</h1>
        </header>

        <section className="admin-content">
          {activeTab === 'teams' && (
            <div className="admin-grid-two-col">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="update-form-card glass-card">
                  <h3>REGISTER TEAM</h3>
                  <form onSubmit={handleCreateTeam} className="admin-form-vertical">
                    <input placeholder="Team Name" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} required />
                    <input placeholder="ID (e.g. csk)" value={newTeam.id} onChange={e => setNewTeam({...newTeam, id: e.target.value})} required />
                    <button type="submit" className="save-btn">CREATE TEAM</button>
                  </form>
                </div>
                <div className="update-form-card glass-card">
                  <h3>CREATE PLAYER</h3>
                  <form onSubmit={handleCreatePlayer} className="admin-form-vertical">
                    <input placeholder="Player Name" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} required />
                    <select value={newPlayer.team} onChange={e => setNewPlayer({...newPlayer, team: e.target.value})} required>
                      <option value="" disabled>Select Team Allocation</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button type="submit" className="save-btn">ADD PLAYER</button>
                  </form>
                </div>
              </div>
                <div className="admin-list-card">
                  <h3>EXISTING TEAMS</h3>
                  <button onClick={bulkLoadAllTeams} className="btn-secondary" style={{ marginBottom: '15px', width: '100%', fontSize: '0.7rem' }}>
                    ⚡ BULK LOAD ALL TEAMS (GT, MI, KKR, RCB, RR, DC, SRH, PBKS, CSK)
                  </button>
                  <button onClick={handleRemoveDuplicates} className="btn-secondary" style={{ marginBottom: '15px', width: '100%', fontSize: '0.7rem', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d' }}>
                    🚨 REMOVE DUPLICATE PLAYERS
                  </button>
                  <div className="admin-items-list">
                    {teams.map(t => {
                      const count = players.filter(p => p.team === t.id).length;
                      return (
                        <div key={t.id} className="team-item-admin" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <div className="item-info" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="item-name">
                              {t.icon} {t.name}
                              <span style={{ fontSize: '0.7em', color: '#00ffff', background: 'rgba(0, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '10px', marginLeft: '10px' }}>
                                {count} Players
                              </span>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <button onClick={() => handleDeleteTeam(t.id)} className="btn-delete-small" title="Delete Team">🗑️</button>
                            </div>
                          </div>
                          
                          {count > 0 && (
                            <div style={{ width: '100%', marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                              <h4 style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', letterSpacing: '1px' }}>
                                TEAM ROSTER
                              </h4>
                              {players.filter(p => p.team === t.id).map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                  <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{p.name}</span>
                                  <button onClick={() => handleDeletePlayer(p.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    ✖ Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
            </div>
          )}

          {activeTab === 'scoreboard' && activeSbTeam && (
            <div className="admin-grid-two-col">
              {/* Left: team selector + match/team fields */}
              <div className="update-form-card glass-card">
                <h3>EDIT TEAM SCORECARD</h3>

                {/* Team selector tabs */}
                <div className="sb-admin-team-tabs">
                  {scoreboardData.map(t => (
                    <button
                      key={t.id}
                      className={`sb-admin-tab ${selectedSbTeam === t.id ? 'active' : ''}`}
                      onClick={() => setSelectedSbTeam(t.id)}
                    >{t.name}</button>
                  ))}
                </div>

                <div className="admin-form-vertical" style={{ marginTop: '1.5rem' }}>

                  <div className="input-group">
                    <label>Team Display Name</label>
                    <input
                      value={activeSbTeam.name}
                      onChange={e => updateSbField('name', e.target.value)}
                    />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'10px' }}>
                    <div className="input-group">
                      <label>Total Score</label>
                      <input type="number" value={activeSbTeam.totalScore}
                        onChange={e => updateSbField('totalScore', Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: roster selection */}
              <div className="update-form-card glass-card">
                <h3>ASSIGN SCORES — {activeSbTeam.name}</h3>
                <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginBottom:'15px' }}>
                  Select players from the team roster and assign points. Total score will be calculated automatically.
                </p>
                
                <div className="sb-admin-players">
                  {/* Show current squad members first */}
                  {activeSbTeam.players.map((p, idx) => (
                    <div key={idx} className="sb-admin-player-row">
                      <span className="sb-pl-name-fixed">{p.name}</span>
                      <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                        <label style={{ fontSize:'0.6rem', opacity:0.5 }}>PTS</label>
                        <input
                          className="sb-pl-runs"
                          type="number"
                          min="0"
                          value={p.points || p.runs || 0}
                          onChange={e => updateSbPlayer(idx, 'points', Number(e.target.value))}
                        />
                      </div>
                      <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                        <label style={{ fontSize:'0.6rem', opacity:0.5 }}>MAT</label>
                        <input
                          className="sb-pl-runs sb-pl-matches" 
                          type="number"
                          min="0"
                          value={p.matches || 0}
                          onChange={e => updateSbPlayer(idx, 'matches', Number(e.target.value))}
                        />
                      </div>
                      <button
                        className="btn-delete-small"
                        onClick={() => removeSbPlayer(idx)}
                        title="Remove"
                      >✕</button>
                    </div>
                  ))}
                </div>

                <div className="sb-admin-roster-selector" style={{ marginTop:'20px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'15px' }}>
                  <label style={{ fontSize:'0.8rem', color:'#fccf14', display:'block', marginBottom:'10px' }}>Add from Roster:</label>
                  <select 
                    style={{ width:'100%', marginBottom:'10px' }}
                    onChange={(e) => {
                      if(e.target.value === "extras") {
                        setScoreboardData(prev => prev.map(t => 
                          t.id === selectedSbTeam 
                            ? { ...t, players: [...t.players, { name: 'Extras', points: 0 }] } 
                            : t
                        ));
                      } else if(e.target.value) {
                        const player = players.find(p => p.id === e.target.value);
                        if(player) {
                          setScoreboardData(prev => prev.map(t => 
                            t.id === selectedSbTeam && !t.players.some(p => p.name === player.name)
                              ? { ...t, players: [...t.players, { name: player.name, points: 0, matches: 0 }] } 
                              : t
                          ));
                        }
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">Choose Player...</option>
                    <option value="extras">+ Add Extras Field</option>
                    {players.filter(p => p.team === selectedSbTeam).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop:'1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                  <button className="save-btn" style={{ flex:1 }} onClick={handleSaveScoreboard}>
                    💾 SAVE TO SCOREBOARD
                  </button>
                  {sbSaveMsg && <span style={{ color: sbSaveMsg.startsWith('✅') ? '#00ff88' : '#ff4d4d', fontSize:'0.85rem' }}>{sbSaveMsg}</span>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="admin-list-card glass-card">
              <h3>USER FEEDBACK & COMMENTS</h3>
              <div className="admin-items-list">
                {feedback.length === 0 ? (
                  <p style={{ color:'rgba(0,0,0,0.4)', textAlign:'center', padding:'20px' }}>No feedback yet.</p>
                ) : (
                  feedback.map(f => (
                    <div key={f.id} className="team-item-admin" style={{ flexDirection:'column', alignItems:'flex-start', gap:'10px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
                        <span className="item-name" style={{ color:'#fccf14' }}>{f.userName || 'Anonymous'}</span>
                        <div style={{ display:'flex', gap:'10px' }}>
                          <button className="btn-delete-small" onClick={() => setEditingFeedback(f)} title="Edit">✏️</button>
                          <button className="btn-delete-small" style={{ background:'rgba(255,77,77,0.1)', color:'#ff4d4d' }} onClick={() => handleDeleteFeedback(f.id)}>✕</button>
                        </div>
                      </div>
                      {editingFeedback?.id === f.id ? (
                        <div style={{ width:'100%', display:'flex', gap:'10px' }}>
                          <input 
                            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid #fccf14', color:'white', padding:'8px', borderRadius:'8px' }}
                            value={editingFeedback.comment}
                            onChange={(e) => setEditingFeedback({...editingFeedback, comment: e.target.value})}
                          />
                          <button className="save-btn" style={{ padding:'8px 15px', fontSize:'0.7rem' }} onClick={() => handleUpdateFeedback(f.id, editingFeedback.comment)}>SAVE</button>
                        </div>
                      ) : (
                        <p style={{ fontSize:'0.9rem', color:'#1a1a2e', fontWeight: '500' }}>{f.comment}</p>
                      )}
                      <span style={{ fontSize:'0.7rem', color:'rgba(0,0,0,0.4)' }}>{f.timestamp?.toDate().toLocaleString() || 'Match Day'}</span>
                    </div>
                  ))
                )}
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
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button type="submit" className="save-btn" style={{ flex: 2 }}>UPDATE SCORES</button>
                    <button type="button" onClick={handleClearScores} className="save-btn" style={{ flex: 1, background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d' }}>CLEAR</button>
                  </div>
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
