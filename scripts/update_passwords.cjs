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
 { id: 'Champ3203', pass: 'Champ@3203' },
];

async function updatePasswords() {
  for (const team of teams) {
    const email = `${team.id}@iplauction.com`;
    try {
      // 1. Sign in with old pass
      const userCredential = await signInWithEmailAndPassword(auth, email, team.oldPass);
      // 2. Update to new pass
      await updatePassword(userCredential.user, team.newPass);
      console.log(`Password Updated: ${team.id} -> ${team.newPass}`);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
                // Check if already updated
                try {
                    await signInWithEmailAndPassword(auth, email, team.newPass);
                    console.log(`Verified: ${team.id} already has the new password.`);
                } catch (innerErr) {
                    console.error(`Failed to update ${team.id}:`, err.message);
                }
      } else {
        console.error(`Error updating ${team.id}:`, err.message);
      }
    }
  }
  process.exit(0);
}

updatePasswords();
