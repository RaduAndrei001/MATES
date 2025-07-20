import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Navbar from './components/Navbar';
import Games from './pages/Games';
import Community from './pages/Community';
import Library from './pages/Library';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import GameDetails from './pages/GameDetails';


function App() {
  // Stocăm utilizatorul logat în state
  const [user, setUser] = useState(null);

  // Ascultăm schimbările de auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup: dezabonare de la eveniment când se demontează App (rareori necesar, dar e bună practica)
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      {/* Navbar va fi comun: primește user și setUser ca props */}
      <Navbar user={user} setUser={setUser} />
      
<Routes>
  <Route path="/" element={<Games />} />
  <Route path="/games/:id" element={<GameDetails />} />
  <Route path="/community" element={<Community />} />
  <Route path="/library" element={<Library />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/edit-profile" element={<EditProfile />} /> 
</Routes>

    </BrowserRouter>
  );
}

export default App;
