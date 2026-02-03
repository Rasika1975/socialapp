const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

router.post("/", async (req, res) => {
  const post = await Post.create(req.body);
  res.json(post);
});

router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

router.put("/:id/like", async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.likes.push(req.body);
  await post.save();
  res.json(post);
});

router.put("/:id/comment", async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.comments.push(req.body);
  await post.save();
  res.json(post);
});

module.exports = router;
