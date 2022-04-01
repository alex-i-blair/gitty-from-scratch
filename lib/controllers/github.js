const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GitHubUser = require('../models/GitHubUser');
const { exchangeCodeForToken, getGitHubProfile } = require('../utils/github');

const ONE_DAY_IN_MS = 1000 * 60 ** 2 * 24;
