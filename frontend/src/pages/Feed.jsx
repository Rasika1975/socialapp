import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';
import { postsAPI } from '../services/api';

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getPosts(1, 10);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = (postId) => {
    if (!currentUser) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const isLiked = post.likes?.some((like) => like.userId === currentUser._id);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter((like) => like.userId !== currentUser._id)
              : [...(post.likes || []), { userId: currentUser._id, username: currentUser.username }]
          };
        }
        return post;
      })
    );
  };

  const handleDelete = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  const handleComment = (postId, commentText) => {
    if (!currentUser) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          const newComment = {
            _id: `temp-${Date.now()}`,
            text: commentText,
            userId: currentUser._id,
            username: currentUser.username,
            createdAt: new Date().toISOString()
          };
          return {
            ...post,
            comments: [...(post.comments || []), newComment]
          };
        }
        return post;
      })
    );
  };

  if (loading) {
    return (
      <div className="page-background">
        <div className="feed-container">
          <Navbar />
          <div className="skeleton" style={{ height: '200px', marginBottom: '24px' }}></div>
          <div className="skeleton" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background">
      <div className="feed-container">
        <Navbar />

        <div className="top-banner">
          <div className="top-banner-copy">
            <span className="top-banner-title">Hot streak unlocked</span>
            <span className="top-banner-text">Jump into the lobby, share a moment, and keep the feed alive.</span>
          </div>
          <span className="live-badge">Live</span>
        </div>

        <section className="feed-hero">
          <span className="section-chip">Premium Arena</span>
          <h1>Mobile-first social feed with a sharper gaming pulse.</h1>
          <p>Dark glass panels, neon controls, and clean spacing keep the experience immersive without changing your app flow.</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-label">Squad</span>
              <span className="hero-stat-value">{currentUser?.username || 'Player'}</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-label">Posts</span>
              <span className="hero-stat-value">{posts.length}</span>
            </div>
          </div>
        </section>

        <CreatePost onPostCreated={handlePostCreated} />

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onLike={handleLike}
              onDelete={handleDelete}
              onComment={handleComment}
            />
          ))
        ) : (
          <div className="post-card empty-state">
            <h3>No posts yet</h3>
            <p>Be the first to share something amazing!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
