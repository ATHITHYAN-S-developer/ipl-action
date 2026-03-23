const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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

const teams = [
  { id: 'CSK', pass: 'CSK@2025' },
  { id: 'MI', pass: 'MI@2025' },
  { id: 'RCB', pass: 'RCB@2025' },
  { id: 'KKR', pass: 'KKR@2025' },
  { id: 'DC', pass: 'DC@2025' },
  { id: 'PBKS', pass: 'PBKS@2025' },
  { id: 'RR', pass: 'RR@2025' },
  { id: 'SRH', pass: 'SRH@2025' },
  { id: 'GT', pass: 'GT@2025' },
  { id: 'LSG', pass: 'LSG@2025' }
];

async function registerTeams() {
  for (const team of teams) {
    const email = `${team.id}@iplauction.com`;
    try {
      await createUserWithEmailAndPassword(auth, email, team.pass);
      console.log(`Successfully registered: ${team.id}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`Skipped: ${team.id} (already exists)`);
      } else {
        console.error(`Error registering ${team.id}:`, err.message);
      }
    }
  }
  process.exit(0);
}

registerTeams();
