const Post = require("../models/Post");

// Helper to get base URL
const getBaseUrl = (req) => {
  return process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get("host")}`;
};

// Helper to fix localhost URLs in production
const fixPostImage = (post, baseUrl) => {
  if (post.image && post.image.includes("localhost")) {
    return post.image.replace(/http:\/\/localhost:\d+/, baseUrl);
  }
  return post.image;
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

    const postResponse = post.toObject();
    postResponse.image = fixPostImage(postResponse, getBaseUrl(req));

    res.status(201).json(postResponse);
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

    const baseUrl = getBaseUrl(req);
    const sanitizedPosts = posts.map((post) => {
      const p = post.toObject();
      p.image = fixPostImage(p, baseUrl);
      return p;
    });

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
    const p = post.toObject();
    p.image = fixPostImage(p, getBaseUrl(req));
    res.json(p);
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
    const p = post.toObject();
    p.image = fixPostImage(p, getBaseUrl(req));
    res.status(201).json(p);
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

module.exports = { createPost, getAllPosts, likePost, commentOnPost, deletePost };
