const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GitHubUser = require('../models/GitHubUser');
const { exchangeCodeForToken, getGitHubProfile } = require('../utils/github');

const ONE_DAY_IN_MS = 1000 * 60 ** 2 * 24;

module.exports = Router()
  .get('/login', (req, res) => {
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=http://localhost:7890/api/v1/github/login/callback`
    );
  })
  .get('/login/callback', (req, res, next) => {
    const { code } = req.query;
    let profile;
    exchangeCodeForToken(code)
      .then((token) => getGitHubProfile(token))
      .then((user) => {
        profile = user;
        console.log(
          '🚀 ~ file: github.js ~ line 22 ~ .then ~ profile',
          profile
        );
      })
      .then(() => GitHubUser.findByUsername(profile.login))
      .then((user) => {
        if (!user) {
          return GitHubUser.insert({
            username: profile.login,
            avatar: profile.avatar_url,
            email: profile.email,
          });
        }
        return user;
      })
      .then((user) =>
        jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
          expiresIn: '1d',
        })
      )
      .then((payload) => {
        res
          .cookie(process.env.COOKIE_NAME, payload, {
            httpOnly: true,
            maxAge: ONE_DAY_IN_MS,
          })
          .redirect('/api/v1/github/posts');
      })
      .catch((error) => next(error));
  })

  .get('/posts', authenticate, (req, res) => {
    res.json(req.user);
  })
  .delete('/', (req, res) => {
    res.clearCookie(process.env.COOKIE_NAME).json({
      success: true,
      message: 'Signed Out',
    });
  });
