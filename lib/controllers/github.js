const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GitHubUser = require('../models/GitHubUser');
const { exchangeCodeForToken, getGitHubProfile } = require('../utils/github');

const ONE_DAY_IN_MS = 1000 * 60 ** 2 * 24;

module.exports = Router()
  .get('/login', async (req, res) => {
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=http://localhost:7890/api/v1/github/login/callback`
    );
  })
  .get('/login/callback', async (req, res, next) => {
    try {
      const { code } = req.query;
      const token = await exchangeCodeForToken(code);
      const userInfo = await getGitHubProfile(token);
      let user = await GitHubUser.findByUsername(userInfo.login);
      if (!user) {
        user = await GitHubUser.insert({
          username: userInfo.login,
          avatar: userInfo.avatar_url,
          email: userInfo.email,
        });
      }
      const payload = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      res
        .cookie(process.env.COOKIE_NAME, payload, {
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
        })
        .redirect('/api/v1/posts');
    } catch (error) {
      next(error);
    }
  })
  .get('/posts', authenticate, async (req, res) => {
    res.json(req.user);
  })
  .delete('/', async (req, res) => {
    res.clearCookie(process.env.COOKIE_NAME).json({
      success: true,
      message: 'Signed Out',
    });
  });
