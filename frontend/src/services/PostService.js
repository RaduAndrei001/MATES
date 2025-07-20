import PostRepository from '../repositories/PostRepository';
import PostFactory from '../factories/PostFactory';
import { serverTimestamp } from 'firebase/firestore';


// Dacă există var. de mediu → foloseşte‑o.
// Altfel, dacă rulezi FE pe :3000 sau :5173, înlocuieşte cu :5000.
function computeHealthUrl() {
  if (process.env.REACT_APP_BACKEND_HEALTH) return process.env.REACT_APP_BACKEND_HEALTH;

  const origin = window.location.origin;
  const guess = origin.replace(/:(3000|5173)$/, ':5000');
  return `${guess}/health`;
}

const PostService = {
  async createPost({ userId, username, postName, content, imageUrl }) {
    const post = PostFactory.createPost({
      userId,
      username,
      title: postName,
      message: content,
      timestamp: serverTimestamp(),
    });
    if (imageUrl) post.imageUrl = imageUrl;
    return await PostRepository.addPost(post);
  },

  listenToPosts(callback, onError) {
    return PostRepository.getPosts(
      (posts) => callback(Array.isArray(posts) ? posts : []),
      onError,
    );
  },

  async addComment(postId, comment) {
    const commentData = PostFactory.createComment({
      userId: comment.userId,
      username: comment.username,
      text: comment.text,
      timestamp: serverTimestamp(),
    });
    return await PostRepository.addComment(postId, commentData);
  },

  /**
   * Health‑check cu 2 strategii:
   *   • absolute URL din .env → REACT_APP_BACKEND_HEALTH
   *   • else: deduce "acelaşi host cu port 5000", compatibil cu Express default.
   * Intoarce `true` la 200‑299 sau la status `0` (no‑cors opaque).
   */
  async ping(timeoutMs = 4000) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const healthUrl = computeHealthUrl();

    try {
      const res = await fetch(healthUrl, {
        signal: controller.signal,
        cache: 'no-store',
        mode: 'no-cors',
      });
      clearTimeout(t);
      return res.ok || res.status === 0;
    } catch (err) {
      console.warn(`[PostService] ping failed for ${healthUrl}:`, err);
      return false;
    }
  },
};

export default PostService;
