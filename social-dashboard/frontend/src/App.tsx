// Social Dashboard Frontend
// React + TypeScript + Vite

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Auth Components
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });
      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
      <p>Demo credentials: username: "user1", password: "password123"</p>
    </div>
  );
};

const RegisterForm = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        email,
        password
      });
      onRegister();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

// Components
const PostComponent = ({ post, currentUser, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      await onComment(post._id, newComment);
      setNewComment('');
    } catch (err) {
      console.error('Error commenting:', err);
    } finally {
      setCommenting(false);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <h3>Post by User {post.userId}</h3>
        <span className="post-date">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && <img src={post.image} alt="Post" className="post-image" />}
      </div>
      <div className="post-actions">
        <button
          className={`like-btn ${post.likes.includes(currentUser?.userId) ? 'liked' : ''}`}
          onClick={() => onLike(post._id)}
        >
          Like ({post.likes?.length || 0})
        </button>
        <button
          className="comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          Comment ({post.comments?.length || 0})
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <h4>Comments</h4>
          {post.comments?.map((comment, index) => (
            <div key={index} className="comment">
              <span className="comment-author">User {comment.userId}:</span>
              <span className="comment-content">{comment.content}</span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commenting}
            />
            <button type="submit" disabled={commenting || !newComment.trim()}>
              {commenting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const HomePage = ({ token, onLogout }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser(decoded);
      fetchPosts();
    }
  }, [token]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/posts", newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPost({ content: '', image: '' });
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/posts/${postId}/like", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      await axios.post(`${API_BASE_URL}/api/posts/${postId}/comment", { content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      console.error('Error commenting on post:', err);
      throw err;
    }
  };

  return (
    <div className="home-page">
      <div className="header">
        <h1>Social Media Dashboard</h1>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="create-post">
        <h3>Create a Post</h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            required
            rows={3}
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={newPost.image}
            onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
          />
          <button type="submit" disabled={loading}>Post</button>
        </form>
      </div>

      <div className="posts-feed">
        <h3>Recent Posts</h3>
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostComponent
              key={post._id}
              post={post}
              currentUser={currentUser}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))
        ) : (
          <div className="no-posts">No posts yet. Be the first to post!</div>
        )}
      </div>
    </div>
  );
};

const AuthPage = ({ onLogin, onRegister, showRegister }) => {
  return (
    <div className="auth-page">
      {showRegister ? (
        <RegisterForm onRegister={onRegister} />
      ) : (
        <LoginForm onLogin={onLogin} />
      )}
      <div className="auth-switch">
        <button
          onClick={() => onRegister(!showRegister)}
          className={!showRegister ? 'active' : ''}
        >
          {!showRegister ? 'Register' : 'Login'}
        </button>
      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
  };

  if (!token) {
    return <AuthPage onLogin={handleLogin} onRegister={toggleRegister} showRegister={showRegister} />;
  }

  return <HomePage token={token} onLogout={handleLogout} />;
}

export default App;