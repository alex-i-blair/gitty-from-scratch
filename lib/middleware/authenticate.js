const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const cookie = req.cookies[process.env.COOKIE_NAME];
  if (!cookie) throw new Error('Please Sign In');
  const user = jwt.verify(cookie, process.env.JWT_SECRET);
  req.user = user;
  next();
};
