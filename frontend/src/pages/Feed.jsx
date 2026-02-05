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

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
    
    // Fetch posts
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
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId) => {
    if (!currentUser) return;
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes?.some(like => like.userId === currentUser._id);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(like => like.userId !== currentUser._id)
              : [...(post.likes || []), { userId: currentUser._id, username: currentUser.username }]
          };
        }
        return post;
      })
    );
  };

  const handleDelete = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  const handleComment = (postId, commentText) => {
    if (!currentUser) return;
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
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
            comments: [...(post.comments || []), newComment],
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
        <CreatePost onPostCreated={handlePostCreated} />
        
        {posts.length > 0 ? (
          posts.map(post => (
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
          <div className="post-card text-center" style={{ padding: '40px 20px' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
              No posts yet
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Be the first to share something amazing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;