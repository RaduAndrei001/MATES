import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import SignInRegisterModal from './SignInRegisterModal';
import './Navbar.css';
import '../App.css';

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar({ user, setUser }) {
  const [showModal, setShowModal] = useState(false);
  const navigate                  = useNavigate();

  /* ───────────────────── THEMES ───────────────────── */
  const themes = [
    'default-theme',
    'light-theme',
    'ocean-theme',
    'forest-theme',
    'pastel-theme',
    'midnight-theme'
  ];
  const [currentTheme, setCurrentTheme] = useState('default-theme');

  /* ──────────────────── AVATAR ────────────────────── */
  const [avatar, setAvatar] = useState(null);

  /* 1. Aplicăm tema salvată la prima montare */
  useEffect(() => {
    const storedTheme = localStorage.getItem('currentTheme');
    const chosenTheme = storedTheme || currentTheme;

    document.body.classList.add(chosenTheme);
    setCurrentTheme(chosenTheme);

    if (!storedTheme) localStorage.setItem('currentTheme', chosenTheme);
    // eslint-disable-next-line
  }, []);

  /* 2. La schimbarea USER-ului sau la un event custom refacem avatarul */
  useEffect(() => {
    const refreshAvatar = () => {
      if (user) {
        const img = localStorage.getItem(`localProfileImage_${user.uid}`);
        setAvatar(img || null);
      } else {
        setAvatar(null);
      }
    };

    refreshAvatar();                                  // rulează imediat

    /* ascultăm evenimentul declanşat din EditProfile */
    window.addEventListener('profileImageUpdated', refreshAvatar);

    return () => window.removeEventListener('profileImageUpdated', refreshAvatar);
  }, [user]);

  /* 3. Schimbarea temei */
  const handleThemeChange = () => {
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme    = themes[(currentIndex + 1) % themes.length];

    document.body.classList.replace(currentTheme, nextTheme);
    setCurrentTheme(nextTheme);
    localStorage.setItem('currentTheme', nextTheme);
  };

  /* 4. Modal & Auth helpers */
  const handleOpenModal     = () => setShowModal(true);
  const handleCloseModal    = () => setShowModal(false);
  const handleLogout        = async () => { await signOut(auth); setUser(null); };
  const handleClickUserName = () => navigate('/profile');

  /* ──────────────────── RENDER ────────────────────── */
  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <NavLink to="/" className="brand-link" end>MATES</NavLink>

          <NavLink to="/"          className={({isActive})=>`nav-link ${isActive?'active':''}`}>Store</NavLink>
          <NavLink to="/community" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Community</NavLink>
          <NavLink to="/library"   className={({isActive})=>`nav-link ${isActive?'active':''}`}>Library</NavLink>
        </div>

        <div className="nav-right">
          <button className="theme-button" onClick={handleThemeChange}>🎨 Teme</button>

          {user ? (
            <div className="user-info">
              <img
                src={avatar || 'default-profile.jpg'}
                alt="Profile"
                className="navbar-avatar"
                onClick={handleClickUserName}
              />
              <span className="user-name" onClick={handleClickUserName}>
                {user.displayName || user.email}
              </span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <button className="sign-button" onClick={handleOpenModal}>
              Sign In / Register
            </button>
          )}
        </div>
      </nav>

      {showModal && (
        <SignInRegisterModal onClose={handleCloseModal} setUser={setUser} />
      )}
    </>
  );
}

export default Navbar;
