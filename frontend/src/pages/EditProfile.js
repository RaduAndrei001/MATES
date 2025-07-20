import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import MusicPlayerModal from '../components/MusicPlayerModal';
import './EditProfile.css';

function EditProfile() {
  const navigate                     = useNavigate();
  const [loading, setLoading]        = useState(true);
  const [currentImage, setCurImg]    = useState(null);
  const [tempImage,    setTempImg]   = useState(null);

  const [profileData, setProfile] = useState({
    username:      '',
    userNickname:  '',
    favoriteGame:  '',
    favoriteMusic: '',
    region:        '',
  });

  const [isMusicOpen, setMusic] = useState(false);

  const regions = [
    'N/A','North America','South America','Central America','Caribbean',
    'Northern Europe','Southern Europe','Eastern Europe','Western Europe',
    'Middle East','Northern Africa','Southern Africa','Central & South Asia',
    'Northeastern Asia','Southeastern Asia','Australia and Oceania'
  ];

  /* preload */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate('/');

      try {
        const res = await fetch(`/api/users/${user.uid}`);
        if (res.ok) setProfile(await res.json());
      } catch (err) {
        console.error('Profile load error:', err);
      }

      const img = localStorage.getItem(`localProfileImage_${user.uid}`);
      if (img) setCurImg(img);
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleChange = (e) =>
    setProfile({ ...profileData, [e.target.name]: e.target.value });

  /* ──────────────── File select → preview ─────────────── */
  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTempImg(ev.target.result);
    reader.readAsDataURL(f);
  };

  /* ──────────────── Submit ─────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    await fetch(`/api/users/${user.uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });

    /* salvăm imaginea în localStorage + declanşăm evenimentul custom */
    if (tempImage) {
      localStorage.setItem(`localProfileImage_${user.uid}`, tempImage);
      window.dispatchEvent(new Event('profileImageUpdated'));
    }

    navigate('/profile');
  };

  const handleTitleSelect = (title) =>
    setProfile((p) => ({ ...p, favoriteMusic: title }));

  if (loading) return <div>Loading profile data…</div>;

  /* ──────────────── RENDER ─────────────── */
  return (
    <div className="edit-profile-container">
      <h2>Edit Your Profile</h2>

      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* image preview */}
        {currentImage && !tempImage && (
          <div style={{ marginBottom: 10 }}>
            <p>Current Profile Image:</p>
            <img src={currentImage} alt="Current" style={{ width: 100 }} />
          </div>
        )}
        {tempImage && (
          <div style={{ marginBottom: 10 }}>
            <p>New Profile Image (unsaved):</p>
            <img src={tempImage} alt="Preview" style={{ width: 100 }} />
          </div>
        )}
        <div className="form-group">
          <label>Profile Image</label>
          <input type="file" accept="image/*" onChange={handleFileSelect} />
        </div>

        {/* text fields */}
        <div className="form-group"><label>Username</label>
          <input name="username" value={profileData.username} onChange={handleChange} />
        </div>
        <div className="form-group"><label>Nickname</label>
          <input name="userNickname" value={profileData.userNickname} onChange={handleChange} />
        </div>
        <div className="form-group"><label>Favorite Game</label>
          <input name="favoriteGame" value={profileData.favoriteGame} onChange={handleChange} />
        </div>

        {/* music */}
        <div className="form-group">
          <label>Favorite Music</label>
          <input name="favoriteMusic" value={profileData.favoriteMusic} onChange={handleChange} />
          <button
            type="button"
            className="open-music-btn"
            style={{ marginTop: 8 }}
            onClick={() => setMusic(true)}
          >
            Preview Music
          </button>
        </div>

        {/* region */}
        <div className="form-group"><label>Region</label>
          <select name="region" value={profileData.region} onChange={handleChange}>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <button type="submit" className="save-changes-btn">Save Changes</button>
      </form>

      <MusicPlayerModal
        open={isMusicOpen}
        onClose={() => setMusic(false)}
        onTitleSelect={handleTitleSelect}
      />
    </div>
  );
}

export default EditProfile;
