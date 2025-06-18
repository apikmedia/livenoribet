const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stream = require('../models/Stream');
const Video = require('../models/Video');
const isAuthenticated = require('../middleware/isAuthenticated');
const checkSubscription = require('../middleware/check-subscription');

// Middleware untuk memeriksa apakah user expired
const checkNotExpired = async (req, res, next) => {
  try {
    console.log('checkNotExpired middleware called');
    console.log('User session:', JSON.stringify(req.session.user));
    
    // Jika user tidak expired, lanjutkan
    if (req.session.user && req.session.user.is_expired !== true) {
      console.log('User is not expired, continuing');
      return next();
    }
    
    // Jika user expired, redirect ke dashboard dengan pesan error
    console.log('User is expired, redirecting to dashboard');
    req.session.errorMessage = 'Your subscription has expired. Please renew to continue streaming.';
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error checking subscription:', error);
    next(error);
  }
};

// Route untuk membuat stream baru
router.get('/new', isAuthenticated, checkSubscription, checkNotExpired, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    // Cek jumlah stream aktif
    const activeStreams = await Stream.countActiveByUserId(user.id);
    if (activeStreams >= user.max_streams) {
      return res.render('error', {
        title: 'Error',
        message: `You have reached the maximum number of active streams (${user.max_streams})`
      });
    }
    
    // Ambil video untuk dipilih
    const videos = await Video.findAll(user.id);
    
    res.render('stream/new', {
      title: 'New Stream',
      active: 'streams',
      videos: videos
    });
  } catch (error) {
    console.error('Error creating new stream:', error);
    res.redirect('/dashboard');
  }
});

// Route untuk memulai stream
router.post('/start/:id', isAuthenticated, checkSubscription, checkNotExpired, async (req, res) => {
  try {
    const streamId = req.params.id;
    const userId = req.session.userId;
    
    // Cek apakah stream milik user
    const stream = await Stream.findById(streamId);
    if (!stream || stream.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to start this stream'
      });
    }
    
    const user = await User.findById(userId);
    
    // Cek jumlah stream aktif
    const activeStreams = await Stream.countActiveByUserId(userId);
    if (activeStreams >= user.max_streams) {
      return res.status(400).json({
        success: false,
        error: `You have reached the maximum number of active streams (${user.max_streams})`
      });
    }
    
    // Mulai stream
    await Stream.startStream(streamId, userId);
    
    res.json({
      success: true,
      message: 'Stream started successfully'
    });
  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start stream'
    });
  }
});

module.exports = router; 