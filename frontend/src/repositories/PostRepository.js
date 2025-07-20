import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

class PostRepository {
  getPosts(callback, onError) {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    return onSnapshot(
      q,
      async (snapshot) => {
        const posts = [];
        for (const doc of snapshot.docs) {
          const commentsSnapshot = await getDocs(collection(db, `posts/${doc.id}/comments`));
          const comments = commentsSnapshot.docs.map((commentDoc) => ({
            id: commentDoc.id,
            ...commentDoc.data(),
          }));

          const postData = {
            id: doc.id,
            ...doc.data(),
            comments: comments || [],
          };

          posts.push(postData);
        }

        callback(posts);
      },
      (error) => {
        console.error("Eroare la preluarea postărilor:", error);
        if (onError) onError(error);
      }
    );
  }

  async addPost(postData) {
    return await addDoc(collection(db, 'posts'), postData);
  }

  async addComment(postId, commentData) {
    const commentsRef = collection(db, `posts/${postId}/comments`);
    return await addDoc(commentsRef, commentData);
  }

  async getComments(postId) {
    const commentsSnapshot = await getDocs(collection(db, `posts/${postId}/comments`));
    return commentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

export default new PostRepository();
