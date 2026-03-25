import React, { useState } from 'react';
import { postsAPI } from '../services/api';

const PostCard = ({ post, currentUser, onLike, onDelete, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const isOwner = currentUser?._id === post.userId;
  const isLiked = post.likes?.some((like) => like.userId === currentUser?._id);
  const isRecent = post.createdAt && (new Date() - new Date(post.createdAt)) < 1000 * 60 * 60 * 6;

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
      const postUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(postUrl);
      alert('Post link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing post:', error);
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
      console.log(`Replying to comment ${commentId}: ${replyText}`);
      setReplyText('');
      setReplyingTo(null);
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
    }

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="header-left">
          <div className="avatar-large">
            {post.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-meta">
              <div className="username">{post.username || 'Unknown User'}</div>
              {isRecent && <span className="live-badge">Live</span>}
            </div>
            <div className="time-text">{formatDate(post.createdAt)}</div>
          </div>
        </div>
        {isOwner && (
          <button
            className="action-btn"
            onClick={handleDelete}
            title="Delete post"
            type="button"
            style={{ color: '#fca5a5' }}
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

      <div className="post-caption">
        <span className="feature-pill">Featured drop</span>
        <span className="time-text">{post.likes?.length || 0} hype</span>
      </div>

      {post.text && <div className="post-text">{post.text}</div>}

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="post-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      <div className="action-divider"></div>
      <div className="action-bar">
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{post.likes?.length || 0}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
          type="button"
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
          type="button"
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

      {showComments && (
        <div className="comments-panel">
          <div className="comments-list">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="comment-card">
                <div className="comment-head">
                  <div
                    className="avatar"
                    style={{
                      width: '28px',
                      height: '28px',
                      minWidth: '28px',
                      fontSize: '12px',
                      background: 'linear-gradient(135deg, #6d28d9 0%, #c084fc 100%)',
                      boxShadow: 'none'
                    }}
                  >
                    {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="comment-content">
                    <div className="comment-meta">
                      <div className="comment-author">{comment.username || 'Unknown User'}</div>
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="reply-btn"
                        type="button"
                      >
                        Reply
                      </button>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                </div>

                {replyingTo === comment._id && (
                  <form onSubmit={(e) => handleReplySubmit(comment._id, e)} className="reply-form">
                    <div className="reply-actions">
                      <div
                        className="avatar"
                        style={{
                          width: '24px',
                          height: '24px',
                          minWidth: '24px',
                          fontSize: '10px',
                          background: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)',
                          boxShadow: 'none'
                        }}
                      >
                        {currentUser?.username?.charAt(0)?.toUpperCase() || 'Y'}
                      </div>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="reply-input"
                        style={{ flex: 1 }}
                        autoFocus
                      />
                      <button type="submit" disabled={!replyText.trim()} className="reply-submit">
                        Post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="reply-list">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="reply-item">
                        <div
                          className="avatar"
                          style={{
                            width: '20px',
                            height: '20px',
                            minWidth: '20px',
                            fontSize: '10px',
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                            boxShadow: 'none'
                          }}
                        >
                          {reply.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="reply-body">
                          <span className="comment-author">{reply.username || 'Unknown User'}</span>
                          <span className="reply-text" style={{ marginLeft: '6px' }}>
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
              <div className="text-center" style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div
              className="avatar"
              style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                fontSize: '14px',
                background: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)'
              }}
            >
              {currentUser?.username?.charAt(0)?.toUpperCase() || 'Y'}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={commentLoading || !newComment.trim()}
              className="comment-submit"
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
