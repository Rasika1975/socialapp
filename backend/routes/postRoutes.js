const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  likePost,
  commentOnPost,
  deletePost,
} = require("../controller/postController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router
  .route("/")
  .post(protect, upload.single("image"), createPost)
  .get(getAllPosts);

router.route("/:id").delete(protect, deletePost);

router.route("/:id/like").put(protect, likePost);

router.route("/:id/comment").put(protect, commentOnPost);

module.exports = router;
