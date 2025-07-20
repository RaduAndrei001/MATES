
# ✅ Testare aplicație

Acest fișier documentează testele realizate manual pentru funcționalitățile aplicației web Steam-like.

---

## 🔐 1. Autentificare
- [x] Înregistrare cont nou – utilizatorul poate crea un cont nou prin Firebase Auth
- [x] Autentificare cont existent – logarea funcționează corect
- [x] Logout – utilizatorul este delogat și redirecționat

---

## 📝 2. Postări
- [x] Creare postare – utilizatorul poate adăuga o postare cu text și imagine
- [x] Comentarii la postări – comentariile apar corect sub postare
- [x] Sortare postări – postările sunt afișate în ordine descrescătoare după data creării

---

## 🎮 3. Jocuri și recenzii
- [x] Vizualizare listă jocuri – jocurile din Firestore sunt afișate corect
- [x] Adăugare recenzie – utilizatorul poate adăuga o recenzie pentru un joc
- [x] Afișare evaluare – recenziile sunt afișate împreună cu numele utilizatorului

---

## 📸 4. Upload imagine
- [x] Upload imagine la postare – fișierul este stocat în Firebase Storage
- [x] Afișare imagine postată – imaginea apare corect în UI

---

## 🔄 5. Actualizare în timp real
- [x] Postările noi apar fără refresh – onSnapshot funcționează
- [x] Comentariile apar imediat ce sunt adăugate – sincronizare reușită

---

## ✅ Concluzie
Toate funcționalitățile principale ale aplicației au fost testate manual și funcționează conform așteptărilor. Testarea a fost realizată pe mai multe browsere și conturi diferite.
