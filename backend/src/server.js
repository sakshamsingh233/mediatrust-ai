import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { configureCloudinary } from './config/cloudinary.js';
import healthRoutes from './routes/healthRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';

configureCloudinary();

const app = express();

const PORT = process.env.PORT || 5001;

// CORS configuration
app.use(
  cors({
    origin: [
      // Local development
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',

      // Production frontend
      'https://mediatrust-ai.vercel.app',
    ],
  }),
);

// JSON body parser
app.use(express.json());

// API routes
app.use('/api', healthRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/analysis', analysisRoutes);

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `MediaTrust AI backend listening on port ${PORT}`,
  );
});