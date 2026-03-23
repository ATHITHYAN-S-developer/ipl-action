const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBdegVyEpSmpSpRffC9xwrzWp6wifI-w74",
  authDomain: "resume-analyzer-52bff.firebaseapp.com",
  projectId: "resume-analyzer-52bff",
  storageBucket: "resume-analyzer-52bff.firebasestorage.app",
  messagingSenderId: "902158575395",
  appId: "1:902158575395:web:5e6700b9514b8f88b70e96",
  measurementId: "G-TK887PSEDR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const teams = [
  { id: 'csk', name: 'Chennai Super Kings' },
  { id: 'mi', name: 'Mumbai Indians' },
  { id: 'rcb', name: 'Royal Challengers Bangalore' },
  { id: 'kkr', name: 'Kolkata Knight Riders' },
  { id: 'dc', name: 'Delhi Capitals' },
  { id: 'pbks', name: 'Punjab Kings' },
  { id: 'rr', name: 'Rajasthan Royals' },
  { id: 'srh', name: 'Sunrisers Hyderabad' },
  { id: 'gt', name: 'Gujarat Titans' },
  { id: 'lsg', name: 'Lucknow Super Giants' }
];

async function updateTeams() {
  for (const team of teams) {
    const email = `${team.id}@iplauction.com`;
    const password = `${team.id}@001`;
    
    // 1. Register in Auth
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log(`Auth Registered: ${team.id}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`Auth Skipped: ${team.id} (already exists)`);
      } else {
        console.error(`Auth Error ${team.id}:`, err.message);
      }
    }

    // 2. Update Firestore
    try {
      await setDoc(doc(db, "teams", team.id.toUpperCase()), {
        teamName: team.name,
        teamId: team.id.toUpperCase(),
        loginId: team.id,
        passwordHint: password, // As requested "update in db"
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`Firestore Updated: ${team.id.toUpperCase()}`);
    } catch (err) {
      console.error(`Firestore Error ${team.id}:`, err.message);
    }
  }
  process.exit(0);
}

updateTeams();
