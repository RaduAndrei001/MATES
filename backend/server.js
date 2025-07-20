const express = require('express');
const cors    = require('cors');
const { admin, db } = require('./firebase');
const { FieldValue } = require('firebase-admin').firestore;

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

/* ───────────────────── USERS (Profile) ───────────────────── */
app.get('/api/users/:uid', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:uid', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.uid).set(req.body, { merge: true });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ───────────────────── GAMES & REVIEWS ───────────────────── */
app.get('/api/games', async (_req, res) => {
  try {
    const snap  = await db.collection('games').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const doc = await db.collection('games').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Game not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/games/:id/reviews', async (req, res) => {
  try {
    const snap = await db.collection('games').doc(req.params.id)
                         .collection('reviews').orderBy('timestamp','desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/games/:id/reviews', async (req, res) => {
  try {
    await db.collection('games').doc(req.params.id)
            .collection('reviews').add({
              rating:  req.body.rating,
              comment: req.body.comment,
              timestamp: FieldValue.serverTimestamp()
            });
    res.status(201).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ───────────────────── USER LIBRARY  (colecția userGames) ───────────────────── */

 // LISTĂ
 app.get('/api/users/:uid/library', async (req, res) => {
  try {
    const snap = await db.collection('userGames')
                         .where('userId', '==', req.params.uid)
                         .get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ADĂUGARE (la download)
app.post('/api/users/:uid/library', async (req, res) => {
  try {
    /* corpul cererii conține: gameId, gameTitle, gameImageUrl, genre etc. */
    const docRef = await db.collection('userGames').add({
      ...req.body,
      userId: req.params.uid,
      addedAt: FieldValue.serverTimestamp()
    });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ȘTERGERE
app.delete('/api/users/:uid/library/:docId', async (req, res) => {
  try {
    await db.collection('userGames').doc(req.params.docId).delete();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ───────────────────── COMMUNITY POSTS ───────────────────── */
// ➊  LISTĂ POSTĂRI + comentarii
app.get('/api/community/posts', async (_req, res) => {
  try {
    const postSnap = await db.collection('posts')
                             .orderBy('timestamp','desc').get();

    const posts = await Promise.all(
      postSnap.docs.map(async d => {
        const comSnap = await d.ref.collection('comments')
                           .orderBy('timestamp','asc').get();
        return { id:d.id, ...d.data(),
                 comments: comSnap.docs.map(c => ({ id:c.id, ...c.data() })) };
      })
    );

    res.json(posts);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ➋  CREARE POSTARE
app.post('/api/community/posts', async (req, res) => {
  try {
    const ref = await db.collection('posts').add({
      userId:   req.body.userId,
      username: req.body.username,
      title:    req.body.title,
      message:  req.body.content || req.body.message || '',
      content:  req.body.content || req.body.message || '',
      timestamp: FieldValue.serverTimestamp()
    });
    const doc = await ref.get();
    res.status(201).json({ id: doc.id, ...doc.data(), comments: [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ➌  ADD COMMENT
app.post('/api/community/posts/:id/comments', async (req, res) => {
  try {
    await db.collection('posts').doc(req.params.id)
            .collection('comments').add({
              userId:   req.body.userId,
              username: req.body.username,
              text:     req.body.text,
              timestamp: FieldValue.serverTimestamp()
            });

    // trimitem lista actualizată
    const cs = await db.collection('posts').doc(req.params.id)
                       .collection('comments').orderBy('timestamp','asc').get();
    res.status(201).json(cs.docs.map(c => ({ id:c.id, ...c.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('API running on', PORT));
