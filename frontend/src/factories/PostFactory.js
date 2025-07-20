export default class PostFactory {
    static createPost({ userId, username, title, message, timestamp }) {
      return {
        userId,
        username,
        title,
        message,
        timestamp, // Acum timestamp-ul e setat din exterior cu serverTimestamp()
      };
    }
  
    static createComment({ userId, username, text, timestamp }) {
      return {
        userId,
        username,
        text,
        timestamp,
      };
    }
  }
  