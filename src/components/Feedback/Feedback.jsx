import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import './Feedback.css';

const Feedback = () => {
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(null);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setFeed(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addDoc(collection(db, 'feedback'), {
        userName: userName.trim() || 'Anonymous',
        comment: comment.trim(),
        timestamp: serverTimestamp()
      });
      setUserName('');
      setComment('');
      setStatus({ type: 'success', msg: 'Thank you for your feedback!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Error sending feedback. Please try again.' });
    }
  };

  return (
    <div className="feedback-container premium-glass-theme">
      <div className="feedback-header">
        <h1 className="feedback-title pulse">PLAYER FEEDBACK</h1>
        <p className="feedback-subtitle">WE VALUE YOUR THOUGHTS AND COMMENTS</p>
      </div>

      <div className="feedback-layout">
        <div className="feedback-card glass-card">
          <h3>SHARE YOUR THOUGHTS</h3>
          <form onSubmit={handleSubmit} className="feedback-form">
            {status && (
              <div className={`status-alert ${status.type}`}>
                {status.msg}
              </div>
            )}
            
            <div className="input-group">
              <label>YOUR NAME (OPTIONAL)</label>
              <input 
                type="text" 
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>COMMENT / FEEDBACK</label>
              <textarea 
                rows="4"
                placeholder="What's on your mind?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              🚀 SEND FEEDBACK
            </button>
          </form>
        </div>

        <div className="feedback-feed glass-card">
          <h3>RECENT COMMENTS</h3>
          <div className="comments-list">
            {feed.length === 0 ? (
              <p className="no-comments">Be the first to leave a comment!</p>
            ) : (
              feed.map(f => (
                <div key={f.id} className="comment-item">
                  <div className="comment-meta">
                    <span className="comment-author">{f.userName}</span>
                    <span className="comment-time">
                      {f.timestamp?.toDate() ? f.timestamp.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="comment-text">{f.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
