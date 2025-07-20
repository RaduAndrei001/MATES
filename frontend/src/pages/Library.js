import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Library.css';

function Library() {
  const [games, setGames]       = useState([]);
  const [genres, setGenres]     = useState([]);
  const [selected, setSel]      = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [menu, setMenu]         = useState({ visible:false, x:0, y:0, game:null });
  const [search, setSearch]     = useState('');

  const navigate = useNavigate();

  /* ───────── LOAD LIBRARY FROM BACKEND ───────── */
  const loadLibrary = async (uid) => {
    setLoading(true);
    try {
      const list = await fetch(`/api/users/${uid}/library`).then(r => r.json());
      const uniq = [];
      const seen = new Set();
      list.forEach(g => {
        if (!seen.has(g.gameId)) {
          seen.add(g.gameId);
          uniq.push(g);
        }
      });

      setGames(uniq);

      const gset = new Set();
      uniq.forEach(g => Array.isArray(g.genre)
        ? g.genre.forEach(gs => gset.add(gs))
        : g.genre && gset.add(g.genre));
      setGenres([...gset]);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Eroare la preluarea jocurilor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) { setError('Trebuie să fii autentificat.'); setLoading(false); return; }
      loadLibrary(u.uid);
    });
    return () => unsub();
  }, []);

  /* ───────── CONTEXT MENU & DELETE ───────── */
  const showContextMenu = (e, game) => {
    e.preventDefault();
    setMenu({ visible:true, x:e.clientX, y:e.clientY, game });

    const hide = () => { setMenu(m => ({ ...m, visible:false })); document.removeEventListener('click', hide); };
    document.addEventListener('click', hide);
  };

  const deleteGame = async () => {
    if (!menu.game) return;
    try {
      await fetch(`/api/users/${auth.currentUser.uid}/library/${menu.game.id}`, { method:'DELETE' });
      loadLibrary(auth.currentUser.uid);              // re-fresh list
    } catch {
      alert('Eroare la ștergere.');
    }
    setMenu(m => ({ ...m, visible:false }));
  };

  /* ───────── FILTERS ───────── */
  const byGenre  = selected ? games.filter(g => (Array.isArray(g.genre) ? g.genre.includes(selected) : g.genre === selected)) : games;
  const filtered = byGenre.filter(g => g.gameTitle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="library-body">
      <div className="library-container">

        {/* ─── SIDEBAR ─── */}
        <div className="sidebar">
          <h3>Genuri</h3>
          <p style={{ cursor:'pointer', fontWeight: selected===null?'bold':'normal' }}
             onClick={() => setSel(null)}>Toate jocurile</p>
          {genres.map(g => (
            <p key={g} style={{ cursor:'pointer', fontWeight: selected===g?'bold':'normal' }}
               onClick={() => setSel(g)}>{g}</p>
          ))}
        </div>

        {/* ─── MAIN ─── */}
        <div className="main-content">
          <div className="header">
            <h1>{selected || 'Toate jocurile'}</h1>
            <input className="search-bar" placeholder="Caută un joc…"
                   value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="game-list">
            {loading ? (
              <p>Se încarcă biblioteca…</p>
            ) : error ? (
              <p style={{ color:'red' }}>{error}</p>
            ) : filtered.length === 0 ? (
              <p>Nu am găsit jocuri.</p>
            ) : (
              filtered.map(g => (
                <div key={g.id} className="game"
                     onContextMenu={e => showContextMenu(e, g)}
                     onClick={() => navigate(`/games/${g.gameId}`)}>
                  <img src={g.gameImageUrl} alt={g.gameTitle} />
                  <p>{g.gameTitle}</p>
                </div>
              ))
            )}

            {menu.visible && (
              <div className="context-menu" style={{ left:menu.x, top:menu.y }}>
                <button onClick={deleteGame}>Șterge jocul</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Library;
