import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore  } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyB4RJYc_n308tCjHncUTx7yls4ZFW1IUtg",
  authDomain: "hackathone-61cb2.firebaseapp.com",
  projectId: "hackathone-61cb2",
  storageBucket: "hackathone-61cb2.appspot.com",
  messagingSenderId: "119337899612",
  appId: "1:119337899612:web:f54852c91dc860640cf899",
  measurementId: "G-8SMDR66QZR"
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

export {app,db,firebaseConfig,auth}