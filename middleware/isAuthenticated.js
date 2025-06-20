/**
 * Middleware untuk memeriksa apakah user sudah login
 */
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

module.exports = isAuthenticated; 