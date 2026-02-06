const Post = require("../models/Post");

// Helper to sanitize post objects (remove broken localhost/local paths)
const sanitizePost = (post) => {
  const p = post.toObject ? post.toObject() : post;
  // If image is local path, localhost, or not a web URL, mark it as null
  if (p.image && (p.image.includes("localhost") || p.image.includes("/opt/render") || !p.image.startsWith("http"))) {
    p.image = null;
  }
  return p;
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  const { text } = req.body;
  let image = req.file ? req.file.path : null;
  
  // CRITICAL: In production, if a file is uploaded, it MUST be a Cloudinary URL.
  // If `req.file` exists but `req.file.path` is not a full URL (i.e., doesn't start with "http"),
  // it means Cloudinary is misconfigured and the app has fallen back to broken local storage.
  // We must fail here to prevent saving bad data and alert the developer.
  if (req.file && !image.startsWith("http")) {
    console.error("CRITICAL UPLOAD ERROR: Cloudinary storage is not working. Check environment variables. Uploaded file path is not a URL:", image);
    // Do not save the post. Return a server error.
    return res.status(500).json({ message: "Server file upload service is misconfigured. Post not created." });
  }

  if (!text && !image) {
    return res
      .status(400)
      .json({ message: "Post must have either text or an image." });
  }

  try {
    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      text,
      image,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all posts with pagination
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalPosts = await Post.countDocuments();

    const sanitizedPosts = posts.map((post) => sanitizePost(post));

    res.json({
      posts: sanitizedPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Like or unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.some(
      (like) => like.userId.toString() === req.user._id.toString()
    );

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (like) => like.userId.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push({ userId: req.user._id, username: req.user.username });
    }

    await post.save();
    res.json(sanitizePost(post));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Comment on a post
// @route   PUT /api/posts/:id/comment
// @access  Private
const commentOnPost = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId: req.user._id,
      username: req.user.username,
      text,
    });
    await post.save();
    res.status(201).json(sanitizePost(post));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "User not authorized to delete this post" });
    }

    await post.deleteOne();

    res.json({ message: "Post removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete all posts (for cleanup as requested)
// @route   DELETE /api/posts/delete-all-posts
// @access  (Should be protected in a real app)
const deleteAllPosts = async (req, res) => {
  try {
    const result = await Post.deleteMany({});
    res.json({ message: `Successfully deleted ${result.deletedCount} posts.` });
  } catch (error) {
    console.error("Error deleting all posts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Test Cloudinary upload (for debugging as requested)
// @route   POST /api/posts/cloudinary-test
// @access  Public
const cloudinaryTest = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  res.json({
    success: true,
    message: "Cloudinary working!",
    cloudinaryUrl: req.file.path,
    filename: req.file.filename
  });
};

module.exports = { createPost, getAllPosts, likePost, commentOnPost, deletePost, deleteAllPosts, cloudinaryTest };
