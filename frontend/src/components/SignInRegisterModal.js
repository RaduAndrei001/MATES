import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './SignInRegisterModal.css';

function SignInRegisterModal({ onClose, setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSwitchMode = () => {
    setIsRegister((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isRegister) {
        // Login cu Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // userCredential.user => utilizatorul logat
        setUser(userCredential.user); 
        onClose();
      } else {
        // Înregistrare cu Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Setăm displayName în profilul contului Firebase
        await updateProfile(userCredential.user, {
          displayName: username,
        });

        // Creăm un document în Firestore "users/{uid}" cu date suplimentare (avatar, level etc.)
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: username,
          email: email,
          profileImage: 'default-profile.jpg',
          userNickname: 'Newbie', 
          favoriteGame: '',
          favoriteMusic: '',
        });

        setUser(userCredential.user);
        onClose();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isRegister ? 'Create an Account' : 'Sign In'}</h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="submit-btn">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="switch-mode">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={handleSwitchMode}>
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignInRegisterModal;
