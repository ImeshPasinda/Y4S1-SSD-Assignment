import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'
import csurf from 'csurf';
import colors from 'colors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import path from 'path';

dotenv.config();

connectDB();

const app = express();

// const cookieParser = require('cookie-parser');
// const csrf = require('csurf');

app.use(cookieParser());

// Use csurf middleware to generate and verify CSRF tokens
// const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to all routes that require it
app.use(csurf({ cookie: true }))

// Include the CSRF token in response locals
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
// CSRF Protection Middleware (csrf token is stored in a cookie)
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// Set CSRF token in response cookie
app.use((req, res, next) => {
  res.cookie('_csrf', req.csrfToken(), { httpOnly: true ,sameSite: 'Strict'});
  next();
});
// Body parser
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// PayPal Config
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

