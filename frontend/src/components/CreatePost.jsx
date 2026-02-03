import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Box, 
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import { AddPhotoAlternate } from '@mui/icons-material';
import { postsAPI } from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    if (!text.trim() && !image) {
      setError('Please enter text or upload an image.');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      if (text.trim()) {
        formData.append('text', text.trim());
      }
      if (image) {
        formData.append('image', image);
      }

      const response = await postsAPI.createPost(formData);
      onPostCreated(response.data);
      
      // Reset form
      setText('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create Post
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {imagePreview && (
            <Box sx={{ mb: 2, position: 'relative' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  objectFit: 'cover'
                }} 
              />
              <Button 
                onClick={handleRemoveImage}
                variant="contained"
                color="error"
                size="small"
                sx={{ mt: 1 }}
              >
                Remove Image
              </Button>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddPhotoAlternate />}
            >
              Add Image
              <input
                id="image-upload"
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading || (!text.trim() && !image)}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;