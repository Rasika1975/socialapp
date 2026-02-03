import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import { Send } from '@mui/icons-material';

const CommentSection = ({ comments, onAddComment, postId }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
      <Typography variant="subtitle2" gutterBottom>
        Comments ({comments.length})
      </Typography>
      
      {comments.length > 0 && (
        <List dense sx={{ maxHeight: 250, overflowY: 'auto', mb: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
          {comments.map((comment) => (
            <ListItem key={comment._id} sx={{ py: 0.5 }}>
              <Avatar 
                sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}
                alt={comment.username}
              >
                {comment.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <ListItemText
                primary={
                  <Typography variant="body2" component="span">
                    <strong>{comment.username || 'Unknown User'}</strong>
                  </Typography>
                }
                secondary={
                  <>
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ display: 'block' }}
                    >
                      {comment.text}
                    </Typography>
                    <Typography 
                      component="span" 
                      variant="caption" 
                      color="text.secondary"
                    >
                      {formatDate(comment.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={loading || !newComment.trim()}
          startIcon={<Send />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default CommentSection;