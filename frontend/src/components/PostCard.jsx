import React, { useState } from 'react';
import { postsAPI } from '../services/api';

const PostCard = ({ post, currentUser, onLike, onDelete, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const isOwner = currentUser?._id === post.userId;
  const isLiked = post.likes?.some(like => like.userId === currentUser?._id);

  const handleLike = async () => {
    try {
      await postsAPI.likePost(post._id);
      onLike(post._id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(post._id);
        onDelete(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleShare = async () => {
    try {
      // Copy post URL to clipboard
      const postUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(postUrl);
      
      // Show success message (you could implement a toast notification here)
      alert('Post link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing post:', error);
      // Fallback: show post details
      alert(`Post by ${post.username}: ${post.text || 'Check out this post!'}`);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      await postsAPI.commentPost(post._id, newComment.trim());
      onComment(post._id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error commenting:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      // Add reply functionality - you'll need to implement this in your backend
      // For now, I'll show how the UI would work
      console.log(`Replying to comment ${commentId}: ${replyText}`);
      setReplyText('');
      setReplyingTo(null);
      
      // You would call your API here to add the reply
      // await postsAPI.replyToComment(post._id, commentId, replyText.trim());
      
      alert('Reply functionality would be implemented here!');
    } catch (error) {
      console.error('Error replying:', error);
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

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="header-left">
          <div className="avatar-large">
            {post.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="username">{post.username || 'Unknown User'}</div>
            <div className="time-text">{formatDate(post.createdAt)}</div>
          </div>
        </div>
        {isOwner && (
          <button 
            className="action-btn" 
            onClick={handleDelete}
            title="Delete post"
            style={{
              color: '#EF4444',
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Post Content */}
      {post.text && (
        <div className="post-text">
          {post.text}
        </div>
      )}

      {post.image && (
        <img 
          src={`http://localhost:5000${post.image}`} 
          alt="Post" 
          className="post-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Action Bar */}
      <div className="action-divider"></div>
      <div className="action-bar">
        <button 
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{post.likes?.length || 0}</span>
        </button>

        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{post.comments?.length || 0}</span>
        </button>

        <button 
          className="action-btn"
          onClick={handleShare}
          title="Share this post"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '12px' }}>
            {post.comments?.map(comment => (
              <div key={comment._id} style={{ 
                marginBottom: '12px',
                borderLeft: '2px solid var(--border)',
                paddingLeft: '12px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px', 
                  marginBottom: '8px'
                }}>
                  <div className="avatar" style={{ 
                    width: '28px', 
                    height: '28px', 
                    fontSize: '12px',
                    background: '#6B7280'
                  }}>
                    {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                        {comment.username || 'Unknown User'}
                      </div>
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        Reply
                      </button>
                    </div>
                    <div style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {comment.text}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <form 
                    onSubmit={(e) => handleReplySubmit(comment._id, e)}
                    style={{ 
                      marginTop: '8px',
                      marginLeft: '36px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="avatar" style={{ 
                        width: '24px', 
                        height: '24px', 
                        fontSize: '10px',
                        background: 'var(--primary)',
                        minWidth: '24px'
                      }}>
                        {currentUser?.username?.charAt(0)?.toUpperCase() || 'Y'}
                      </div>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '16px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          opacity: !replyText.trim() ? 0.5 : 1
                        }}
                      >
                        Post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Replies Display (if you have nested replies in your data) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div style={{ 
                    marginTop: '8px',
                    marginLeft: '36px'
                  }}>
                    {comment.replies.map(reply => (
                      <div key={reply._id} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '6px', 
                        marginBottom: '6px',
                        fontSize: '13px'
                      }}>
                        <div className="avatar" style={{ 
                          width: '20px', 
                          height: '20px', 
                          fontSize: '10px',
                          background: '#9CA3AF'
                        }}>
                          {reply.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                            {reply.username || 'Unknown User'}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                            {reply.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {(!post.comments || post.comments.length === 0) && (
              <div className="text-center" style={{ 
                padding: '20px', 
                color: 'var(--text-secondary)' 
              }}>
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
          
          {/* Main Comment Form */}
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div className="avatar" style={{ 
              width: '32px', 
              height: '32px', 
              fontSize: '14px',
              background: 'var(--primary)',
              minWidth: '32px'
            }}>
              {currentUser?.username?.charAt(0)?.toUpperCase() || 'Y'}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={commentLoading || !newComment.trim()}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 16px',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: commentLoading || !newComment.trim() ? 0.5 : 1
              }}
            >
              {commentLoading ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;