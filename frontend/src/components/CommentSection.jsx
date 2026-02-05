import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Collapse
} from '@mui/material';
import { 
  Send, 
  ChatBubbleOutline,
  Person
} from '@mui/icons-material';

const CommentSection = ({ comments, onAddComment, postId }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box 
      sx={{ 
        mt: 2,
        borderRadius: '12px',
        border: '1px solid rgba(0,0,0,0.08)',
        bgcolor: 'rgba(0,0,0,0.02)'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.03)'
          }
        }}
        onClick={toggleExpanded}
      >
        <ChatBubbleOutline sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          sx={{ flexGrow: 1 }}
        >
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </Typography>
        <Typography 
          variant="caption" 
          color="primary"
          sx={{ fontWeight: 500 }}
        >
          {expanded ? 'Hide' : 'Show'}
        </Typography>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        
        {comments.length > 0 && (
          <List 
            dense 
            sx={{ 
              maxHeight: 300, 
              overflowY: 'auto',
              px: 2,
              py: 1
            }}
          >
            {comments.map((comment) => (
              <ListItem 
                key={comment._id} 
                sx={{ 
                  py: 1,
                  px: 0,
                  '&:not(:last-child)': {
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 1.5, 
                    fontSize: '0.8rem',
                    bgcolor: 'primary.main'
                  }}
                  alt={comment.username}
                >
                  {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography 
                        variant="subtitle2" 
                        component="span"
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                      >
                        {comment.username || 'Unknown User'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                      >
                        • {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ 
                        color: 'text.primary',
                        lineHeight: 1.4
                      }}
                    >
                      {comment.text}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {comments.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ChatBubbleOutline 
              sx={{ 
                fontSize: 48, 
                color: 'text.secondary', 
                mb: 1,
                opacity: 0.5
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        )}
        
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            p: 2,
            pt: 1,
            display: 'flex', 
            gap: 1,
            borderTop: comments.length > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              fontSize: '0.8rem',
              bgcolor: 'secondary.main'
            }}
          >
            <Person sx={{ fontSize: 16 }} />
          </Avatar>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: 'white',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              },
            }}
          />
          <Tooltip title="Post comment">
            <IconButton
              type="submit"
              disabled={loading || !newComment.trim()}
              sx={{
                alignSelf: 'flex-end',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              <Send />
            </IconButton>
          </Tooltip>
        </Box>
      </Collapse>
    </Box>
  );
};

export default CommentSection;