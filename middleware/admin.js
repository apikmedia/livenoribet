// Middleware untuk mengecek apakah user adalah admin
function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.is_admin !== 1) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = isAdmin; 