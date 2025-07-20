import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import MusicPlayerModal from '../components/MusicPlayerModal';
import './Profile.css';

const safe = (v) => (typeof v === 'string' && v.trim() === '') || !v ? 'N/A' : v;

function Profile() {
  const navigate                 = useNavigate();
  const [profileData, setProfile] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [localImage, setImage]    = useState(null);
  const [isMusicOpen, setMusic]   = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return navigate('/');

      try {
        const res   = await fetch(`/api/users/${u.uid}`);
        if (!res.ok) throw new Error('Network error');
        const data  = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }

      const img = localStorage.getItem(`localProfileImage_${u.uid}`);
      if (img) setImage(img);
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  if (loading)         return <div>Loading profile…</div>;
  if (!profileData)    return <div>No profile data.</div>;

  const { username, userNickname, favoriteGame, favoriteMusic, region } = profileData;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={localImage || 'default-profile.jpg'} alt="Avatar" className="profile-avatar" />
        <div className="profile-info">
          <h2>{safe(username)}</h2>
          <p><strong>Nickname:</strong> {safe(userNickname)}</p>
          <p><strong>Region:</strong> {safe(region)}</p>
        </div>
        <div className="profile-right">
          <button className="edit-profile-btn" onClick={() => navigate('/edit-profile')}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h3>Favorite Game</h3>
        <p>{safe(favoriteGame)}</p>
      </div>

      <div className="profile-section">
        <h3>Favorite Music</h3>
        <p>{safe(favoriteMusic)}</p>
        <button type="button" className="open-music-btn" onClick={() => setMusic(true)}>
          Play
        </button>
      </div>

      <MusicPlayerModal open={isMusicOpen} onClose={() => setMusic(false)} />
    </div>
  );
}

export default Profile;
