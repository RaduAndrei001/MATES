import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Games.css';

const Games = () => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch('/api/games').then(r => r.json());
        setGames(data);
      } catch (e) {
        console.error(e);
        setError('Nu am putut încărca jocurile.');
      }
    })();
  }, []);

  const grouped = [];                      // grupăm câte trei
  for (let i = 0; i < games.length; i += 3) grouped.push(games.slice(i, i + 3));

  return (
    <div className="store-body">
      <header className="store-header"><h1>Bine ai venit în Store</h1></header>

      <div className="container">
        <section className="section gradient-section">
          <h2>Jocuri Disponibile</h2>
          {error ? (
            <p>{error}</p>
          ) : games.length === 0 ? (
            <p>Se încarcă jocurile…</p>
          ) : (
            <div className="game-sections">
              {grouped.map((grp,i) => (
                <div key={i} className="game-section">
                  {grp.map(game => (
                    <div className="game-card" key={game.id}
                         onClick={() => navigate(`/games/${game.id}`)} style={{ cursor:'pointer' }}>
                      <img src={game.imageUrl || '/Imagini/placeholder.jpg'}
                           alt={game.title} className="game-image" />
                      <p>{game.title}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="store-footer">
        <p>© {new Date().getFullYear()} MATES</p>
      </footer>
    </div>
  );
};

export default Games;
