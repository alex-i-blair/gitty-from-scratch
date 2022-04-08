const fetch = require('cross-fetch');

const exchangeCodeForToken = async (code) => {
  const res = await fetch('http://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
    }),
  });

  const { access_token } = await res.json();

  return access_token;
};

const getGitHubProfile = async (token) => {
  const res = await fetch('http://api.github.com/user', {
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
    },
  });

  const { avatar_url, login } = await res.json();
  return { username: login, photoUrl: avatar_url };
};

module.exports = { exchangeCodeForToken, getGitHubProfile };
