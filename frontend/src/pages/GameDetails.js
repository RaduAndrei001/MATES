import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useParams } from 'react-router-dom';
import './GameDetails.css';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame]     = useState(null);
  const [reviews, setRev]   = useState([]);
  const [newRating, setR]   = useState('');
  const [newComment, setC]  = useState('');
  const [slide, setSlide]   = useState(0);
  const [error, setError]   = useState('');

  /* LOAD DETAILS + REVIEWS */
  useEffect(() => {
    (async () => {
      try {
        const g  = await fetch(`/api/games/${id}`).then(r => r.json());
        setGame(g);

        const rs = await fetch(`/api/games/${id}/reviews`).then(r => r.json());
        setRev(rs);
      } catch {
        setError('Jocul nu a fost găsit!');
      }
    })();
  }, [id]);

  /* slideshow */
  useEffect(() => {
    if (!game?.screenshots || game.screenshots.length <= 1) return;
    const int = setInterval(() =>
      setSlide(s => (s + 1) % game.screenshots.length), 8000);
    return () => clearInterval(int);
  }, [game]);

  /* add review */
  const handleSubmitReview = async () => {
    const rating = parseFloat(newRating);
    if (!rating || rating < 1 || rating > 5 || !newComment.trim()) {
      setError('Rating 1-5 și comentariu obligatorii.');
      return;
    }
    setError('');
    await fetch(`/api/games/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment: newComment })
    });
    const rs = await fetch(`/api/games/${id}/reviews`).then(r => r.json());
    setRev(rs);
    setR(''); setC('');
  };

  /* add to library */
  const handleDownload = async () => {
    if (!auth.currentUser) { setError('Trebuie să fii autentificat.'); return; }

    try {
      // ── 1. vedem dacă jocul există deja în bibliotecă ──
      const lib = await fetch(
          `/api/users/${auth.currentUser.uid}/library`
        ).then(r => r.json());
        if (lib.some(item => item.gameId === id)) {
          alert('Ai deja jocul în bibliotecă.');
          return;
        }

      const body = {
        gameId: id,
        gameTitle: game.title,
        gameImageUrl: game.imageUrl || game.screenshots?.[0] || 'placeholder.jpg',
        genre: game.genre
      };
      const res = await fetch(`/api/users/${auth.currentUser.uid}/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
                if (res.status === 409) {
                  alert('Ai deja jocul în bibliotecă.');
                  return;
                }
                throw new Error('Eroare la adăugare');
              }
        
      alert('Jocul a fost adăugat în biblioteca ta!');
    } catch (e) {
      console.error(e);
      setError('Eroare la adăugarea jocului.');
    }
  };

  const nextSlide = () =>
    setSlide(s => game?.screenshots ? (s + 1) % game.screenshots.length : 0);
  const prevSlide = () =>
    setSlide(s => game?.screenshots ? (s - 1 + game.screenshots.length) % game.screenshots.length : 0);

  return (
    <div className="game-details-container">
      {game ? (
        <>
          <h1 className="game-title-main">{game.title}</h1>

          {game.screenshots?.length ? (
            <div className="slideshow-container">
              <button className="slide-button left"  onClick={prevSlide}>↑</button>
              <img src={game.screenshots[slide]} alt="" className="slideshow-image" />
              <button className="slide-button right" onClick={nextSlide}>↑</button>
            </div>
          ) : <p>Nu sunt screenshot-uri.</p>}

          <div className="game-info">
            <p className="game-description">{game.description}</p>

            {game.downloadUrl && (
              <a href={game.downloadUrl} target="_blank" rel="noopener noreferrer"
                 className="download-button" onClick={handleDownload}>
                Descarcă jocul
              </a>
            )}

            {/* table */}
            <div className="game-table">
              <h3>Informații joc</h3>
              <table>
                <tbody>
                  <tr><td>Data lansării</td><td>{game.releaseDate || 'N/A'}</td></tr>
                  <tr><td>Gen</td><td>{Array.isArray(game.genre) ? game.genre.join(', ') : game.genre}</td></tr>
                  <tr><td>Dezvoltator</td><td>{game.developer || 'N/A'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* reviews */}
            <div className="reviews-section">
              <h3>Recenzii</h3>
              {reviews.length ? reviews.map((r,i) => (
                <div key={i} className="review">
                  <strong>Rating: {r.rating}/5</strong><p>{r.comment}</p>
                </div>
              )) : <p>Fără recenzii momentan</p>}

              <div className="review-form">
                <h4>Adaugă o recenzie</h4>
                <input type="number" min="1" max="5" step="0.1"
                       placeholder="Rating" value={newRating} onChange={e => setR(e.target.value)} />
                <textarea placeholder="Comentariu" value={newComment} onChange={e => setC(e.target.value)} />
                <button onClick={handleSubmitReview}>Trimite</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>
            </div>
          </div>
        </>
      ) : <p>Încarcă datele jocului…</p>}
    </div>
  );
};

export default GameDetails;
