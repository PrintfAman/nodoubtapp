const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.post('/fetch-and-save', async (req, res) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) {
      console.error('Failed to fetch posts:', response.status, response.statusText);
      return res.status(500).json({ error: 'Server error' });
    }

    const posts = await response.json();
    await Post.deleteMany({});
    await Post.insertMany(posts);

    return res.json({ message: '100 posts saved successfully' });
  } catch (error) {
    console.error('POST /api/posts/fetch-and-save error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({});
    return res.json(posts);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (Number.isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.json(post);
  } catch (error) {
    console.error('GET /api/posts/:id error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;