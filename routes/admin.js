const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/admin');
const User = require('../models/User');
const csrf = require('csrf');
const tokens = new csrf();

// Middleware untuk memastikan user adalah admin
router.use(isAdmin);

// Middleware untuk verifikasi CSRF token
const verifyCsrf = (req, res, next) => {
  const token = req.body._csrf || req.query._csrf || req.headers['x-csrf-token'];
  if (!token || !tokens.verify(req.session.csrfSecret, token)) {
    return res.status(403).send('Invalid CSRF token');
  }
  next();
};

// GET /admin/users - Menampilkan list user
router.get('/users', async (req, res) => {
  try {
    // Generate CSRF token
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync();
    }
    const csrfToken = tokens.create(req.session.csrfSecret);
    
    const users = await User.getAllUsers();
    res.render('admin/users', { 
      title: 'Admin - User Management',
      users,
      csrfToken,
      active: 'admin'
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /admin/users/add - Menampilkan form add user
router.get('/users/add', (req, res) => {
  res.render('admin/add-user', {
    title: 'Admin - Add User',
    active: 'admin'
  });
});

// POST /admin/users/add - Menambahkan user baru
router.post('/users/add', verifyCsrf, async (req, res) => {
  const { username, email, password, user_type, subscription_expired_at, max_streams } = req.body;
  try {
    await User.createUser({ username, email, password, user_type, subscription_expired_at, max_streams });
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /admin/users/edit/:id - Menampilkan form edit user
router.get('/users/edit/:id', async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);
    res.render('admin/edit-user', { 
      title: 'Admin - Edit User',
      user,
      active: 'admin'
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /admin/users/edit/:id - Mengupdate user
router.post('/users/edit/:id', verifyCsrf, async (req, res) => {
  const { email, user_type, subscription_expired_at, max_streams } = req.body;
  try {
    await User.updateUser(req.params.id, { email, user_type, subscription_expired_at, max_streams });
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /admin/users/delete/:id - Delete a user
router.post('/users/delete/:id', verifyCsrf, async (req, res) => {
  try {
    // Check if user is trying to delete themselves
    if (req.params.id === req.session.userId) {
      return res.status(400).send('Cannot delete your own account');
    }
    
    // Check if user is an admin
    const userToDelete = await User.getUserById(req.params.id);
    if (userToDelete && userToDelete.is_admin === 1) {
      return res.status(400).send('Cannot delete admin users');
    }
    
    await User.deleteUser(req.params.id);
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router; 