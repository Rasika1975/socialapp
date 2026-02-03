import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardActions, 
  Avatar, 
  Typography, 
  IconButton, 
  Button,
  Box
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Comment, 
  Delete 
} from '@mui/icons-material';
import { postsAPI } from '../services/api';
import CommentSection from './CommentSection';

const PostCard = ({ post, currentUser, onLike, onDelete, onComment }) => {
  const [showComments, setShowComments] = React.useState(false);

  const isOwner = currentUser?._id === post.userId;
  const isLiked = post.likes?.some(like => like.userId === currentUser?._id);

  const handleLike = async () => {
    onLike(post._id); // Optimistic update
    try {
      await postsAPI.likePost(post._id);
    } catch (error) {
      console.error('Error liking post:', error);
      onLike(post._id); // Revert on error
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    onDelete(post._id); // Optimistic update
    try {
      await postsAPI.deletePost(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleComment = async (commentText) => {
    try {
      // We call onComment for optimistic update first
      onComment(post._id, commentText);
      await postsAPI.commentPost(post._id, commentText);
    } catch (error) {
      console.error('Error commenting on post:', error);
      // Here you might want to implement a rollback mechanism
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            {post.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        }
        title={<Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>{post.username || 'Unknown User'}</Typography>}
        subheader={formatDate(post.createdAt)}
      />
      
      <CardContent>
        {post.text && (
          <Typography variant="body1" paragraph>
            {post.text}
          </Typography>
        )}
        
        {post.image && (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <img 
              src={`http://localhost:5000${post.image}`} 
              alt="Post" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '400px', 
                borderRadius: '8px',
                objectFit: 'cover'
              }} 
            />
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ display: 'flex', justifyContent: 'space-around', px: 1, borderTop: '1px solid #eee' }}>
        <Box>
          <Button 
            onClick={handleLike}
            color={isLiked ? 'error' : 'default'}
            startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
          >
            {post.likes?.length || 0} Like{post.likes?.length !== 1 && 's'}
          </Button>
        </Box>
        
        <Box>
          <Button onClick={() => setShowComments(!showComments)} startIcon={<Comment />}>
            {post.comments?.length || 0} Comment{post.comments?.length !== 1 && 's'}
          </Button>
        </Box>
        
        {isOwner && (
          <Button onClick={handleDelete} color="error" startIcon={<Delete />}>
            Delete
          </Button>
        )}
      </CardActions>
      
      {showComments && (
        <CommentSection 
          comments={post.comments || []}
          onAddComment={handleComment}
          postId={post._id}
        />
      )}
    </Card>
  );
};

export default PostCard;