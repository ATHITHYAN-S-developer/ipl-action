const { initializeApp } = require('firebase/app');
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
const db = getFirestore(app);

const teams = [
  { name: "Chennai Super Kings", id: "CSK" },
  { name: "Mumbai Indians", id: "MI" },
  { name: "Royal Challengers", id: "RCB" },
  { name: "Kolkata Knight Riders", id: "KKR" },
  { name: "Delhi Capitals", id: "DC" },
  { name: "Punjab Kings", id: "PBKS" },
  { name: "Rajasthan Royals", id: "RR" },
  { name: "Sunrisers Hyderabad", id: "SRH" },
  { name: "Gujarat Titans", id: "GT" },
  { name: "Lucknow Super Giants", id: "LSG" }
];

async function seedFirestore() {
  console.log('Starting Firestore seeding...');
  for (const team of teams) {
    try {
      await setDoc(doc(db, "teams", team.id), {
        teamName: team.name,
        teamId: team.id,
        createdAt: new Date().toISOString()
      });
      console.log(`Seeded Firestore: ${team.id}`);
    } catch (err) {
      console.error(`Error seeding Firestore for ${team.id}:`, err.message);
    }
  }
  console.log('Firestore seeding complete!');
  process.exit(0);
}

seedFirestore();
