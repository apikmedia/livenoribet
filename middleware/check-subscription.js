const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
  try {
    // Skip check if no user is logged in
    if (!req.session.userId) {
      return next();
    }

    // Get current date in YYYY-MM-DD format for comparison
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if we already did the subscription check today
    if (req.session.lastSubscriptionCheck === today && req.session.user) {
      // Use cached subscription status from session
      res.locals.user = req.session.user;
      return next();
    }
    
    // If we reach here, we need to perform the subscription check
    console.log(`Performing daily subscription check for date: ${today}`);
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    // Check if user is admin
    if (user.is_admin === 1) {
      req.session.user = {
        ...user,
        is_expired: false,
        expires_soon: false,
        days_until_expiry: 999 // Large number for admins
      };
      res.locals.user = req.session.user;
      
      // Save today's date as last check date
      req.session.lastSubscriptionCheck = today;
      
      return next();
    }

    // Check subscription expiry
    const expiryDate = new Date(user.subscription_expired_at);
    
    // Calculate days until expiry
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilExpiry = Math.floor((expiryDate - now) / msPerDay);
    
    // Determine user status
    const isExpired = now > expiryDate;
    const expiresSoon = !isExpired && daysUntilExpiry <= 7;
    
    // Only log status changes or when subscription is about to expire
    if (req.session.user?.is_expired !== isExpired || expiresSoon) {
      console.log(`[${today}] User ${user.username}: Status changed or expiring soon - Expired=${isExpired}, Days left=${daysUntilExpiry}`);
    }
    
    // Update user object with subscription status
    req.session.user = {
      ...user,
      is_expired: isExpired,
      expires_soon: expiresSoon,
      days_until_expiry: isExpired ? 0 : daysUntilExpiry
    };
    
    // Save to locals for this request
    res.locals.user = req.session.user;
    
    // Save today's date as last check date
    req.session.lastSubscriptionCheck = today;
    
    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    next(error);
  }
};

module.exports = checkSubscription; 