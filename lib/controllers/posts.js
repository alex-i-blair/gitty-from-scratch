const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Post = require('../models/Post');

module.exports = Router()
  .post('/', authenticate, (req, res, next) => {
    Post.insert(req.body)
      .then((post) => res.json(post))
      .catch((error) => next(error));
    // res.json(post);
    // .catch (error) {
    //   next(error);
    // }
  })
  .get('/', authenticate, async (req, res, next) => {
    try {
      const post = await Post.getPosts();
      res.json(post);
    } catch (error) {
      next(error);
    }
  });
