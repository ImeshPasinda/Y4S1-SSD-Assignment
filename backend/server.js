import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import helmet from 'helmet'; // For security headers
import rateLimit from 'express-rate-limit'; // For rate limiting
import path from 'path';
import { check, validationResult } from 'express-validator'; // For input validation
import multer from 'multer'; // For file upload handling

// Routes
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();
connectDB();

const app = express();

// 1. Add security headers using Helmet
app.use(helmet());

// 2. CORS setup with environment variable for origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Dynamic origin based on env
    credentials: true,
  })
);

// 3. Body parser
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
// 4. Rate limiting to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', apiLimiter); // Apply to all API routes

// 5. Input validation example for user registration
app.post(
  '/api/users/register',
  [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be 6 characters or longer'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Proceed with registration logic
  }
);

// 6. Route for serving PayPal Client ID securely (server-side logic should handle payment)
app.get('/api/config/paypal', (req, res) => {
  res.status(200).json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// 7. Setup for static file serving with safe paths (protect from directory traversal)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// 8. File upload security: Multer setup with file type and size validation
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb('Error: Only images are allowed!');
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 }, // 1MB file size limit
});

// Upload route with file validation
app.use('/api/upload', upload.single('image'), (req, res) => {
  res.status(200).json({ message: 'File uploaded successfully!' });
});

// 9. Serve static assets in production securely
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// 10. Enhanced Error Handling Middleware
// Show stack trace only in development
app.use(notFound);
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Show stack trace in dev mode only
  });
});

// 11. Proper logging for production
// Avoid using console.log for production, use a logger like winston
import winston from 'winston';
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});
