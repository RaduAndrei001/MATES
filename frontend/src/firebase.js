import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Configurația ta generată din Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCekGhLqg0f_FSogKPJ71V8fzL8_tkPFZU",
  authDomain: "steam-clone-2defd.firebaseapp.com",
  projectId: "steam-clone-2defd",
  storageBucket: "steam-clone-2defd.appspot.com",
  messagingSenderId: "755236501826",
  appId: "1:755236501826:web:0a964f007021cfd94030db",
  measurementId: "G-XTH5VN3REW",
};

// Inițializează aplicația
const app = initializeApp(firebaseConfig);

// Inițializează serviciile pe care le vei folosi
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Aici inițializăm storage-ul

// Exportă-le ca să le poți folosi în componente
export { auth, db  ,storage };