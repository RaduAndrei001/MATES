import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import PostService from '../services/PostService';
import './Community.css';

function Community() {
  const [title, setTitle]         = useState('');
  const [message, setMessage]     = useState('');
  const [posts, setPosts]         = useState([]);
  const [commentText, setComment] = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);   

  /* ───────── verificăm backend + listener ───────── */
  useEffect(() => {
    let unsub = () => {};                                   // fallback dacă listener-ul nu pornește

    const init = async () => {
      try {
        // presupune PostService.ping() -> promisiune care returnează true dacă backend e ok
        const ok = await PostService.ping();
        if (ok) {
          unsub = PostService.listenToPosts(
            (data) => { setPosts(data); setLoading(false); },
            (err)  => { setError('Nu am putut încărca postările.'); setLoading(false); }
          );
        } else {
          setBackendOnline(false);
          setLoading(false);
        }
      } catch (err) {        // network / CORS / 5xx
        setBackendOnline(false);
        setLoading(false);
      }
    };

    init();
    return () => unsub();
  }, []);

  /* ───────── create post ───────── */
  const handleSubmitPost = async () => {
    if (!backendOnline)  { alert('Serverul nu este disponibil.'); return; }
    if (!auth.currentUser || !title.trim() || !message.trim()) {
      alert('Completează toate câmpurile și asigură-te că ești logat.');
      return;
    }
    try {
      await PostService.createPost({
        userId:   auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        postName: title,
        content:  message
      });
      setTitle(''); setMessage('');
    } catch (err) {
      console.error(err);
      setError('Eroare la crearea postării.');
    }
  };

  /* ───────── add comment ───────── */
  const handleCommentSubmit = async (postId) => {
    if (!backendOnline) return;
    const text = commentText[postId];
    if (!auth.currentUser || !text?.trim()) return;

    try {
      await PostService.addComment(postId, {
        userId:   auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        text
      });

      setPosts(prev =>
                prev.map(p =>
                  p.id === postId
                    ? {
                        ...p,
                        comments: [
                          ...(p.comments || []),
                          {
                            userId:   auth.currentUser.uid,
                            username: auth.currentUser.displayName || 'Anonymous',
                            text
                          }
                        ]
                      }
                    : p
                )
              );
        
      setComment(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
      setError('Eroare la adăugarea comentariului.');
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="community-body">
      <header className="community-header">
        <h1>Community</h1>
        <p>Share your thoughts with the community</p>
      </header>

      <div className="community-container">
        {/* CREAȚI POSTARE */}
        <div className="section">
          <h2>Create a Post</h2>
          <input
            placeholder="Post title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={!backendOnline}
          />
          <textarea
            placeholder="Write something…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={!backendOnline}
          />
          <button onClick={handleSubmitPost} disabled={!backendOnline}>Post</button>
          {error && <p style={{ color:'red' }}>{error}</p>}
        </div>

        {/* FEED POSTĂRI */}
        <div id="posts">
          <h2>Posts</h2>
          {!backendOnline ? (
            <p style={{ color:'darkred' }}>Serverul de backend este momentan oprit. Încearcă mai târziu.</p>
          ) : loading ? (
            <p>Se încarcă postările…</p>
          ) : posts.length === 0 ? (
            <p>Nu există postări disponibile.</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="section post">
                <strong>Posted by: {post.username || 'Unknown'}</strong>
                <h4 style={{ marginTop:8 }}>{post.title || 'Untitled'}</h4>
                <p>{post.message || post.content || post.text || 'No content'}</p>

                <div className="comments">
                  <h4>Comments</h4>
                  {post.comments?.length ? (
                    post.comments.map((c,i) => (
                      <p key={i}><strong>{c.username}</strong>: {c.text}</p>
                    ))
                  ) : (
                    <p>Nu există comentarii.</p>
                  )}
                  <input
                    placeholder="Write a comment…"
                    value={commentText[post.id] || ''}
                    onChange={e => setComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                    disabled={!backendOnline}
                  />
                  <button onClick={() => handleCommentSubmit(post.id)} disabled={!backendOnline}>
                    Submit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Community;
