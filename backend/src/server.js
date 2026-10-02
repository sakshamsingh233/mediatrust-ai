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

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177', // ✅ ADD THIS
    ],
  }),
);

app.use(express.json());

// API routes
app.use('/api', healthRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/analysis', analysisRoutes);

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not found',
  });
});

app.listen(PORT, () => {
  console.log(
    `MediaTrust AI backend listening on http://localhost:${PORT}`,
  );
});