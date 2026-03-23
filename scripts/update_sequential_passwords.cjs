const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');

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
  { id: 'csk', current: 'csk@001', new: 'csk@001' },
  { id: 'mi', current: 'mi@001', new: 'mi@002' },
  { id: 'rcb', current: 'rcb@001', new: 'rcb@003' },
  { id: 'kkr', current: 'kkr@001', new: 'kkr@004' },
  { id: 'dc', current: 'dc@001', new: 'dc@005' },
  { id: 'pbks', current: 'pbks@001', new: 'pbks@006' },
  { id: 'rr', current: 'rr@001', new: 'rr@007' },
  { id: 'srh', current: 'srh@001', new: 'srh@008' },
  { id: 'gt', current: 'gt@001', new: 'gt@009' },
  { id: 'lsg', current: 'lsg@001', new: 'lsg@010' }
];

async function updateSequential() {
  for (const team of teams) {
    const email = `${team.id}@iplauction.com`;
    try {
      // Try current password first
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, team.current);
      } catch (err) {
        // Fallback to the new password if already updated
        userCredential = await signInWithEmailAndPassword(auth, email, team.new);
        console.log(`Verified: ${team.id} already has ${team.new}`);
        continue;
      }
      
      if (team.current !== team.new) {
        await updatePassword(userCredential.user, team.new);
        console.log(`Updated: ${team.id} -> ${team.new}`);
      } else {
        console.log(`Verified: ${team.id} is already ${team.new}`);
      }
    } catch (err) {
      console.error(`Error with ${team.id}:`, err.message);
    }
  }
  process.exit(0);
}

updateSequential();
