import React, { useState, useEffect } from 'react';
import { Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import { postsAPI } from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch posts
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      const isLoadingMore = pageNum > 1;
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await postsAPI.getPosts(pageNum, 5);
      const newPosts = response.data.posts || [];
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setHasMore(response.data.currentPage < response.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load initial posts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
    fetchPosts(1, false);
  }, []);

  // Handle like
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

  // Handle delete
  const handleDelete = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  // Handle comment
  const handleComment = (postId, commentText) => {
    if (!currentUser) return;
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post._id === postId) {
          const newComment = {
            _id: `temp-${Date.now()}`, // temporary client-side ID
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

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Load more posts
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchPosts(page + 1, true);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Container maxWidth="md">
        <CreatePost onPostCreated={handlePostCreated} />
        
        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
            onLike={handleLike}
            onDelete={handleDelete}
            onComment={handleComment}
          />
        ))}
        
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <Button
              variant="outlined"
              onClick={loadMore}
              disabled={loadingMore}
              sx={{ minWidth: 200 }}
            >
              {loadingMore ? <CircularProgress size={24} /> : 'Load More'}
            </Button>
          </Box>
        )}
        
        {!hasMore && posts.length > 0 && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ my: 3 }}
          >
            You've reached the end!
          </Typography>
        )}
        
        {posts.length === 0 && !loading && (
          <Typography 
            variant="h6" 
            color="text.secondary" 
            align="center" 
            sx={{ my: 5 }}
          >
            No posts yet. Be the first to create one!
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default Feed;