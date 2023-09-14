const express = require('express')
const {
  createPost,
  deletePost,
  getAllPosts,
  getOnePost,
  updatePost,
} = require('../controllers/post.controller')
const protect = require('../middleware/auth.middleware')

const router = express.Router()

router.route('/').get(getAllPosts).post(protect, createPost)

router.route('/:id').get(getOnePost).delete(deletePost).patch(updatePost)

module.exports = router
