import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extract the token
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token, explicitly defining the algorithm
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

      // 3. Fetch user information without the password field
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Proceed to the next middleware
      next();
    } catch (error) {
      // 5. Catch errors related to token expiration and invalid token
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Not authorized, token expired');
      } else {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
  }

  // 6. No token found in headers
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to protect admin routes
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403); // Changed to 403 Forbidden, as it's a permissions issue
    throw new Error('Not authorized as an admin');
  }
};

// 7. Add refresh token functionality (for better user experience)
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d', // Use longer expiry for refresh tokens
  });
};

// 8. Implement token revocation (basic version using blacklist)
let tokenBlacklist = [];
const revokeToken = (token) => {
  tokenBlacklist.push(token); // Simple implementation of adding token to blacklist
};

// Middleware to check if token is revoked
const isTokenRevoked = (token) => {
  return tokenBlacklist.includes(token);
};

// Protect middleware with token revocation check
const protectWithRevocation = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    // Check if the token is revoked
    if (isTokenRevoked(token)) {
      res.status(401);
      throw new Error('Token has been revoked');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect, admin, generateRefreshToken, revokeToken, protectWithRevocation };
